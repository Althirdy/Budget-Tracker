<?php

declare(strict_types=1);

namespace app\commands;

use app\models\User;
use Yii;
use yii\console\Controller;
use yii\console\ExitCode;
use yii\db\Expression;

final class DevSeedController extends Controller
{
    public function actionAuth(): int
    {
        if (!YII_ENV_DEV) {
            $this->stderr("Development seeds are disabled outside the dev environment.\n");
            return ExitCode::UNSPECIFIED_ERROR;
        }

        if (User::find()->where(['or', ['email' => 'admin@example.test'], ['username' => 'admin']])->exists()) {
            $this->stdout("Development admin already exists.\n");
            return ExitCode::OK;
        }

        $now = new Expression('CURRENT_TIMESTAMP');
        $user = new User([
            'email' => 'admin@example.test',
            'username' => 'admin',
            'password_hash' => Yii::$app->security->generatePasswordHash('admin123'),
            'first_name' => 'Admin',
            'last_name' => 'User',
            'default_currency' => 'PHP',
            'role' => User::ROLE_ADMIN,
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        if (!$user->save()) {
            $this->stderr("Unable to create the development admin.\n");
            return ExitCode::DATAERR;
        }

        $this->stdout("Development admin created.\n");
        return ExitCode::OK;
    }
}
