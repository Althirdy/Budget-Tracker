<?php

declare(strict_types=1);

namespace app\tests\Unit\Models;

use app\models\User;
use Yii;
use yii\db\Expression;

final class UserTest extends \Codeception\Test\Unit
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

    public function testFindDbBackedUserByIdUsernameAndLogin(): void
    {
        $user = $this->createUser(User::ROLE_ADMIN);

        verify(User::findIdentity($user->id)?->username)->equals($user->username);
        verify(User::findByUsername($user->username)?->id)->equals($user->id);
        verify(User::findByLogin($user->email)?->id)->equals($user->id);
        verify(User::findByLogin($user->username)?->id)->equals($user->id);
        verify(User::findIdentity(999999))->empty();
    }

    public function testRoleConstantsAndHelpers(): void
    {
        $admin = $this->createUser(User::ROLE_ADMIN);
        $user = $this->createUser(User::ROLE_USER);

        verify(User::ROLE_ADMIN)->equals(1);
        verify(User::ROLE_USER)->equals(2);
        verify($admin->isAdmin())->true();
        verify($admin->isUser())->false();
        verify($admin->getRoleName())->equals('admin');
        verify($user->isAdmin())->false();
        verify($user->isUser())->true();
        verify($user->getRoleName())->equals('user');
    }

    public function testAccessTokenAndAuthKeyAreNotUsedForJwtAuth(): void
    {
        verify(User::findIdentityByAccessToken('100-token'))->empty();

        $user = $this->createUser(User::ROLE_USER);
        verify($user->getAuthKey())->empty();
        verify($user->validateAuthKey('anything'))->false();
    }

    private function createUser(int $role): User
    {
        $suffix = uniqid('unit_', true);
        $now = new Expression('CURRENT_TIMESTAMP');
        $user = new User([
            'email' => "{$suffix}@example.test",
            'username' => $suffix,
            'password_hash' => Yii::$app->security->generatePasswordHash('password123'),
            'first_name' => 'Unit',
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
