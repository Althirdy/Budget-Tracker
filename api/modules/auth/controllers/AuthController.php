<?php

declare(strict_types=1);

namespace app\modules\auth\controllers;

use app\modules\auth\resources\UserResource;
use app\modules\auth\services\AuthService;
use Yii;
use yii\filters\Cors;
use yii\filters\VerbFilter;
use yii\rest\Controller;
use yii\web\BadRequestHttpException;
use yii\web\Response;

class AuthController extends Controller
{
    public $enableCsrfValidation = false;

    private AuthService $authService;

    public function __construct($id, $module, $config = [])
    {
        $this->authService = new AuthService();
        parent::__construct($id, $module, $config);
    }

    public function behaviors(): array
    {
        $behaviors = parent::behaviors();
        $behaviors['corsFilter'] = [
            'class' => Cors::class,
            'cors' => [
                'Origin' => ['http://localhost:5173'],
                'Access-Control-Request-Method' => ['GET', 'POST', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['Authorization', 'Content-Type'],
            ],
        ];
        $behaviors['verbs'] = [
            'class' => VerbFilter::class,
            'actions' => [
                'login' => ['POST'],
                'refresh' => ['POST'],
                'logout' => ['POST'],
                'me' => ['GET'],
                'options' => ['OPTIONS'],
            ],
        ];

        return $behaviors;
    }

    public function beforeAction($action): bool
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        return parent::beforeAction($action);
    }

    public function actionLogin(): array
    {
        $body = Yii::$app->request->getBodyParams();
        $login = trim((string) ($body['login'] ?? ''));
        $password = (string) ($body['password'] ?? '');

        if ($login === '' || $password === '') {
            throw new BadRequestHttpException('Login and password are required.');
        }

        return $this->authService->login($login, $password);
    }

    public function actionRefresh(): array
    {
        return $this->authService->refresh($this->refreshTokenFromBody());
    }

    public function actionLogout(): array
    {
        return $this->authService->logout($this->refreshTokenFromBody());
    }

    public function actionMe(): array
    {
        $user = $this->authService->userFromBearerToken(
            Yii::$app->request->headers->get('Authorization')
        );

        return ['user' => UserResource::toArray($user)];
    }

    public function actionOptions(): array
    {
        return [];
    }

    private function refreshTokenFromBody(): string
    {
        $body = Yii::$app->request->getBodyParams();
        $refreshToken = trim((string) ($body['refreshToken'] ?? ''));

        if ($refreshToken === '') {
            throw new BadRequestHttpException('Refresh token is required.');
        }

        return $refreshToken;
    }
}
