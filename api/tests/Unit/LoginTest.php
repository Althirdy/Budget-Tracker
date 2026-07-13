<?php

declare(strict_types=1);

namespace app\tests\Unit;

use app\controllers\SiteController;
use Yii;
use yii\base\Security;
use yii\web\View;

final class LoginTest extends \Codeception\Test\Unit
{
    protected function _after(): void
    {
        Yii::$app->user->logout();
    }

    // public function testRenderLoginForGuestUser(): void
    // {
    //     $controller = new SiteController(
    //         'site',
    //         Yii::$app,
    //         Yii::$app->mailer,
    //         new Security(),
    //     );

    //     $view = new View(['context' => $controller]);

    //     $controller->actionLogin();

    //     self::assertStringNotContainsString(
    //         'Logout (',
    //         $view->render('//layouts/main.php', ['content' => 'Hello World']),
    //         'Failed asserting that the logout link is not rendered for a guest user.',
    //     );
    // }
}
