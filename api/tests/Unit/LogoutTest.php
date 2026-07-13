<?php

declare(strict_types=1);

namespace app\tests\Unit;

use app\controllers\SiteController;
use app\models\User;
use Yii;
use yii\base\Security;
use yii\db\Expression;
use yii\web\IdentityInterface;
use yii\web\View;

final class LogoutTest extends \Codeception\Test\Unit
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

    public function testRenderLogoutLinkWhenUserIsLoggedIn(): void
    {
        $user = $this->createUser();

        $controller = new SiteController(
            'site',
            Yii::$app,
            Yii::$app->mailer,
            new Security(),
        );

        $view = new View(['context' => $controller]);

        self::assertInstanceOf(IdentityInterface::class, $user);

        Yii::$app->user->login($user);

        $html = $view->render('//layouts/main.php', ['content' => 'Hello World']);

        self::assertStringContainsString(
            'Logout (' . $user->username . ')',
            $html,
            'Failed asserting that the logout link is rendered for a logged-in user.',
        );
        self::assertStringContainsString(
            'data-method="post"',
            $html,
            'Failed asserting that the logout link uses POST method.',
        );

        $controller->actionLogout();

        $html = $view->render('//layouts/main.php', ['content' => 'Hello World']);

        self::assertStringNotContainsString(
            'Logout (' . $user->username . ')',
            $html,
            'Failed asserting that the logout link is not rendered after logout.',
        );
    }

    private function createUser(): User
    {
        $suffix = uniqid('logout_', true);
        $now = new Expression('CURRENT_TIMESTAMP');
        $user = new User([
            'email' => "{$suffix}@example.test",
            'username' => $suffix,
            'password_hash' => Yii::$app->security->generatePasswordHash('password123'),
            'first_name' => 'Logout',
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
