<?php

declare(strict_types=1);

namespace app\tests\Unit\Modules\Auth;

use app\models\User;
use app\modules\auth\models\UserRefreshToken;
use Yii;
use yii\db\Expression;

final class UserRefreshTokenTest extends \Codeception\Test\Unit
{
    private array $userIds = [];

    protected function _after(): void
    {
        if ($this->userIds !== []) {
            Yii::$app->db
                ->createCommand()
                ->delete('{{%user_refresh_tokens}}', ['user_id' => $this->userIds])
                ->execute();

            Yii::$app->db
                ->createCommand()
                ->delete('{{%users}}', ['id' => $this->userIds])
                ->execute();
        }
    }

    public function testHashTokenUsesSha256(): void
    {
        verify(UserRefreshToken::hashToken('plain-refresh-token'))->equals(hash('sha256', 'plain-refresh-token'));
    }

    public function testFindValidTokenReturnsActiveUnexpiredToken(): void
    {
        $token = 'valid-refresh-token-' . uniqid();
        $storedToken = $this->createRefreshToken($token, '+1 hour');

        $foundToken = UserRefreshToken::findValidToken($token);

        verify($foundToken)->notEmpty();
        verify($foundToken->id)->equals($storedToken->id);
    }

    public function testFindValidTokenRejectsRevokedToken(): void
    {
        $token = 'revoked-refresh-token-' . uniqid();
        $storedToken = $this->createRefreshToken($token, '+1 hour');
        $storedToken->revoke();

        verify(UserRefreshToken::findValidToken($token))->empty();
    }

    public function testFindValidTokenRejectsExpiredToken(): void
    {
        $token = 'expired-refresh-token-' . uniqid();
        $this->createRefreshToken($token, '-1 hour');

        verify(UserRefreshToken::findValidToken($token))->empty();
    }

    private function createRefreshToken(string $token, string $expiryModifier): UserRefreshToken
    {
        $user = $this->createUser();
        $now = new Expression('CURRENT_TIMESTAMP');
        $refreshToken = new UserRefreshToken([
            'user_id' => $user->id,
            'token_hash' => UserRefreshToken::hashToken($token),
            'expires_at' => gmdate('Y-m-d H:i:s', strtotime($expiryModifier)),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        verify($refreshToken->save())->true();

        return $refreshToken;
    }

    private function createUser(): User
    {
        $suffix = uniqid('refresh_token_', true);
        $now = new Expression('CURRENT_TIMESTAMP');
        $user = new User([
            'email' => "{$suffix}@example.test",
            'username' => $suffix,
            'password_hash' => Yii::$app->security->generatePasswordHash('password123'),
            'first_name' => 'Refresh',
            'last_name' => 'Tester',
            'default_currency' => 'PHP',
            'role' => User::ROLE_USER,
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        verify($user->save())->true();
        $this->userIds[] = (int) $user->id;

        return $user;
    }
}
