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
    public function login(string $login, string $password): array
    {
        $user = User::findByLogin($login);
        if ($user === null || !Yii::$app->security->validatePassword($password, $user->password_hash)) {
            throw new UnauthorizedHttpException('Invalid login or password.');
        }

        $user->last_login_at = new Expression('CURRENT_TIMESTAMP');
        $user->updated_at = new Expression('CURRENT_TIMESTAMP');
        $user->save(false, ['last_login_at', 'updated_at']);

        return $this->issueTokenPair($user);
    }

    public function refresh(string $refreshToken): array
    {
        $storedToken = UserRefreshToken::findValidToken($refreshToken);
        if ($storedToken === null) {
            throw new UnauthorizedHttpException('Invalid or expired refresh token.');
        }

        $user = User::findIdentity($storedToken->user_id);
        if ($user === null) {
            $storedToken->revoke();
            throw new UnauthorizedHttpException('Invalid refresh token user.');
        }

        $transaction = Yii::$app->db->beginTransaction();
        try {
            $storedToken->revoke();
            $tokenPair = $this->issueTokenPair($user);
            $transaction->commit();

            return $tokenPair;
        } catch (Throwable $exception) {
            $transaction->rollBack();
            throw $exception;
        }
    }

    public function logout(string $refreshToken): array
    {
        $storedToken = UserRefreshToken::findValidToken($refreshToken);
        if ($storedToken !== null) {
            $storedToken->revoke();
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
        if ($userId === null) {
            throw new UnauthorizedHttpException('Invalid access token subject.');
        }

        $user = User::findIdentity($userId);
        if ($user === null) {
            throw new UnauthorizedHttpException('Access token user was not found.');
        }

        return $user;
    }

    public function issueTokenPair(User $user): array
    {
        $accessTokenExpiresAt = time() + $this->accessTtl();
        $refreshTokenExpiresAt = time() + $this->refreshTtl();
        $refreshToken = Yii::$app->security->generateRandomString(64);

        $storedRefreshToken = new UserRefreshToken([
            'user_id' => $user->id,
            'token_hash' => UserRefreshToken::hashToken($refreshToken),
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
            'refreshTokenExpiresAt' => $this->formatTimestamp($refreshTokenExpiresAt),
            'user' => UserResource::toArray($user),
        ];
    }

    private function createAccessToken(User $user, int $expiresAt): string
    {
        $now = time();

        return JWT::encode([
            'iss' => 'budget-tracker-api',
            'aud' => 'budget-tracker-frontend',
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
