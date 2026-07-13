<?php

declare(strict_types=1);

namespace app\tests\Unit\Models;

use app\models\LoginForm;
use app\models\User;
use Yii;
use yii\base\Security;
use yii\db\Expression;

final class LoginFormTest extends \Codeception\Test\Unit
{
    private array $userIds = [];

    protected function _after(): void
    {
        Yii::$app->user->logout();

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

    public function testLoginNoUser(): void
    {
        $model = new LoginForm(
            new Security(),
            [
                'username' => 'not_existing_username',
                'password' => 'not_existing_password',
            ],
        );

        verify($model->login())->false();
        verify(Yii::$app->user->isGuest)->true();
    }

    public function testLoginWrongPassword(): void
    {
        $user = $this->createUser('wrong_password_user', 'correct_password');

        $model = new LoginForm(
            new Security(),
            [
                'username' => $user->username,
                'password' => 'wrong_password',
            ],
        );

        verify($model->login())->false();
        verify(Yii::$app->user->isGuest)->true();
        verify($model->errors)->arrayHasKey('password');
    }

    public function testLoginCorrect(): void
    {
        $user = $this->createUser('login_correct_user', 'correct_password');

        $model = new LoginForm(
            new Security(),
            [
                'username' => $user->username,
                'password' => 'correct_password',
            ],
        );

        verify($model->login())->true();
        verify(Yii::$app->user->isGuest)->false();
        verify($model->errors)->arrayHasNotKey('password');
    }

    private function createUser(string $prefix, string $password): User
    {
        $suffix = uniqid($prefix . '_', true);
        $now = new Expression('CURRENT_TIMESTAMP');
        $user = new User([
            'email' => "{$suffix}@example.test",
            'username' => $suffix,
            'password_hash' => Yii::$app->security->generatePasswordHash($password),
            'first_name' => 'Login',
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
