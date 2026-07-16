<?php

declare(strict_types=1);

namespace app\tests\Unit\Modules\Auth;

use app\models\User;
use app\modules\auth\models\UserRefreshToken;
use app\modules\auth\services\AuthService;
use Yii;
use yii\db\Expression;
use yii\web\UnauthorizedHttpException;

final class AuthServiceTest extends \Codeception\Test\Unit
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

    public function testLoginReturnsTokenPairAndAdminUserSummary(): void
    {
        $user = $this->createUser(User::ROLE_ADMIN, 'secret123');
        $response = (new AuthService())->login($user->username, 'secret123');

        verify($response)->arrayHasKey('accessToken');
        verify($response)->arrayHasKey('refreshToken');
        verify($response)->arrayHasKey('accessTokenExpiresAt');
        verify($response)->arrayHasKey('refreshTokenExpiresAt');
        verify($response['user']['id'])->equals($user->id);
        verify($response['user']['role'])->equals(User::ROLE_ADMIN);
        verify($response['user']['roleName'])->equals('admin');
    }

    public function testLoginRejectsInvalidPassword(): void
    {
        $user = $this->createUser(User::ROLE_USER, 'secret123');

        $this->expectException(UnauthorizedHttpException::class);
        (new AuthService())->login($user->username, 'wrong_password');
    }

    public function testBearerTokenResolvesUser(): void
    {
        $user = $this->createUser(User::ROLE_ADMIN, 'secret123');
        $service = new AuthService();
        $response = $service->login($user->email, 'secret123');

        $resolvedUser = $service->userFromBearerToken('Bearer ' . $response['accessToken']);

        verify($resolvedUser->id)->equals($user->id);
        verify($resolvedUser->role)->equals(User::ROLE_ADMIN);
    }

    public function testRefreshRotatesTokenAndRejectsOldToken(): void
    {
        $user = $this->createUser(User::ROLE_ADMIN, 'secret123');
        $service = new AuthService();
        $loginResponse = $service->login($user->username, 'secret123');

        $refreshResponse = $service->refresh($loginResponse['refreshToken']);

        verify($refreshResponse)->arrayHasKey('accessToken');
        verify($refreshResponse)->arrayHasKey('refreshToken');
        verify($refreshResponse['refreshToken'])->notEquals($loginResponse['refreshToken']);

        $this->expectException(UnauthorizedHttpException::class);
        $service->refresh($loginResponse['refreshToken']);
    }

    public function testRefreshTokenReuseRevokesReplacementFamily(): void
    {
        $user = $this->createUser(User::ROLE_USER, 'secret123');
        $service = new AuthService();
        $loginResponse = $service->login($user->username, 'secret123');
        $refreshResponse = $service->refresh($loginResponse['refreshToken']);

        try {
            $service->refresh($loginResponse['refreshToken']);
        } catch (UnauthorizedHttpException) {
            // Expected replay detection.
        }

        $this->expectException(UnauthorizedHttpException::class);
        $service->refresh($refreshResponse['refreshToken']);
    }

    public function testLogoutRevokesRefreshToken(): void
    {
        $user = $this->createUser(User::ROLE_ADMIN, 'secret123');
        $service = new AuthService();
        $loginResponse = $service->login($user->username, 'secret123');

        verify($service->logout($loginResponse['refreshToken']))->equals(['success' => true]);
        verify(UserRefreshToken::findValidToken($loginResponse['refreshToken']))->empty();
    }

    private function createUser(int $role, string $password): User
    {
        $suffix = uniqid('auth_service_', true);
        $now = new Expression('CURRENT_TIMESTAMP');
        $user = new User([
            'email' => "{$suffix}@example.test",
            'username' => $suffix,
            'password_hash' => Yii::$app->security->generatePasswordHash($password),
            'first_name' => 'Auth',
            'last_name' => 'Tester',
            'default_currency' => 'PHP',
            'role' => $role,
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        verify($user->save())->true();
        $this->userIds[] = (int) $user->id;

        return $user;
    }
}
