<?php

declare(strict_types=1);

namespace app\modules\auth\services;

use app\models\User;
use app\modules\auth\models\UserRefreshToken;
use app\modules\auth\resources\UserResource;
use DateTimeImmutable;
use DateTimeInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Throwable;
use Yii;
use yii\db\Expression;
use yii\web\BadRequestHttpException;
use yii\web\UnauthorizedHttpException;

class AuthService
{
    public function login(string $login, string $password, string $ipAddress = 'unknown'): array
    {
        $throttle = new LoginThrottleService();
        $throttle->assertAllowed($login, $ipAddress);
        $user = User::findByLogin($login);
        if ($user === null || !Yii::$app->security->validatePassword($password, $user->password_hash)) {
            $throttle->recordFailure($login, $ipAddress);
            Yii::warning('Authentication failed for login hash ' . hash('sha256', mb_strtolower($login)), 'auth');
            throw new UnauthorizedHttpException('Invalid login or password.');
        }

        $throttle->clearAccount($login);

        $user->last_login_at = new Expression('CURRENT_TIMESTAMP');
        $user->updated_at = new Expression('CURRENT_TIMESTAMP');
        $user->save(false, ['last_login_at', 'updated_at']);

        Yii::info('Authentication succeeded for user ' . $user->id, 'auth');

        return $this->issueTokenPair($user);
    }

    public function refresh(string $refreshToken): array
    {
        $storedToken = UserRefreshToken::findToken($refreshToken);
        if ($storedToken === null || strtotime($storedToken->expires_at) <= time()) {
            throw new UnauthorizedHttpException('Invalid or expired refresh token.');
        }

        if ($storedToken->revoked_at !== null) {
            UserRefreshToken::revokeFamily($storedToken->family_id);
            Yii::warning('Refresh token reuse detected for family ' . hash('sha256', (string) $storedToken->family_id), 'auth');
            throw new UnauthorizedHttpException('Invalid or expired refresh token.');
        }

        $user = User::findIdentity($storedToken->user_id);
        if ($user === null) {
            $storedToken->revoke();
            throw new UnauthorizedHttpException('Invalid refresh token user.');
        }

        $transaction = Yii::$app->db->beginTransaction();
        try {
            if (!$storedToken->revokeOnce()) {
                UserRefreshToken::revokeFamily($storedToken->family_id);
                $transaction->commit();
                throw new UnauthorizedHttpException('Invalid or expired refresh token.');
            }

            $tokenPair = $this->issueTokenPair($user, $storedToken->family_id);
            $storedToken->replaced_by_id = $tokenPair['refreshTokenId'];
            $storedToken->save(false, ['replaced_by_id']);
            $transaction->commit();

            unset($tokenPair['refreshTokenId']);

            return $tokenPair;
        } catch (Throwable $exception) {
            if ($transaction->getIsActive()) {
                $transaction->rollBack();
            }
            throw $exception;
        }
    }

    public function logout(string $refreshToken): array
    {
        $storedToken = UserRefreshToken::findToken($refreshToken);
        if ($storedToken !== null) {
            UserRefreshToken::revokeFamily($storedToken->family_id);
            if ($storedToken->family_id === null) {
                $storedToken->revoke();
            }
            Yii::info('Session logged out for user ' . $storedToken->user_id, 'auth');
        }

        return ['success' => true];
    }

    public function userFromBearerToken(string|null $authorizationHeader): User
    {
        if ($authorizationHeader === null || !preg_match('/^Bearer\s+(.+)$/i', $authorizationHeader, $matches)) {
            throw new UnauthorizedHttpException('Bearer token is required.');
        }

        try {
            $payload = JWT::decode($matches[1], new Key($this->jwtSecret(), 'HS256'));
        } catch (Throwable) {
            throw new UnauthorizedHttpException('Invalid or expired access token.');
        }

        $userId = $payload->sub ?? null;
        if (
            $userId === null
            || ($payload->iss ?? null) !== $this->issuer()
            || ($payload->aud ?? null) !== $this->audience()
        ) {
            throw new UnauthorizedHttpException('Invalid access token subject.');
        }

        $user = User::findIdentity($userId);
        if ($user === null) {
            throw new UnauthorizedHttpException('Access token user was not found.');
        }

        return $user;
    }

    public function issueTokenPair(User $user, string|null $familyId = null): array
    {
        $accessTokenExpiresAt = time() + $this->accessTtl();
        $refreshTokenExpiresAt = time() + $this->refreshTtl();
        $refreshToken = Yii::$app->security->generateRandomString(64);

        $storedRefreshToken = new UserRefreshToken([
            'user_id' => $user->id,
            'token_hash' => UserRefreshToken::hashToken($refreshToken),
            'family_id' => $familyId ?? Yii::$app->security->generateRandomString(48),
            'expires_at' => gmdate('Y-m-d H:i:s', $refreshTokenExpiresAt),
            'created_at' => new Expression('CURRENT_TIMESTAMP'),
            'updated_at' => new Expression('CURRENT_TIMESTAMP'),
        ]);

        if (!$storedRefreshToken->save()) {
            throw new BadRequestHttpException('Unable to create refresh token.');
        }

        return [
            'accessToken' => $this->createAccessToken($user, $accessTokenExpiresAt),
            'accessTokenExpiresAt' => $this->formatTimestamp($accessTokenExpiresAt),
            'refreshToken' => $refreshToken,
            'refreshTokenId' => (int) $storedRefreshToken->id,
            'refreshTokenExpiresAt' => $this->formatTimestamp($refreshTokenExpiresAt),
            'user' => UserResource::toArray($user),
        ];
    }

    private function createAccessToken(User $user, int $expiresAt): string
    {
        $now = time();

        return JWT::encode([
            'iss' => $this->issuer(),
            'aud' => $this->audience(),
            'iat' => $now,
            'nbf' => $now,
            'exp' => $expiresAt,
            'sub' => (string) $user->id,
            'role' => (int) $user->role,
        ], $this->jwtSecret(), 'HS256');
    }

    private function jwtSecret(): string
    {
        return (string) Yii::$app->params['jwt']['secret'];
    }

    private function issuer(): string
    {
        return (string) Yii::$app->params['jwt']['issuer'];
    }

    private function audience(): string
    {
        return (string) Yii::$app->params['jwt']['audience'];
    }

    private function accessTtl(): int
    {
        return (int) Yii::$app->params['jwt']['accessTokenTtl'];
    }

    private function refreshTtl(): int
    {
        return (int) Yii::$app->params['jwt']['refreshTokenTtl'];
    }

    private function formatTimestamp(int $timestamp): string
    {
        return (new DateTimeImmutable('@' . $timestamp))->format(DateTimeInterface::ATOM);
    }
}
