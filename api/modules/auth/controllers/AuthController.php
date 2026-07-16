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
use yii\web\Cookie;
use yii\web\UnauthorizedHttpException;

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
                'Origin' => [Yii::$app->params['auth']['allowedOrigin']],
                'Access-Control-Request-Method' => ['GET', 'POST', 'OPTIONS'],
                'Access-Control-Request-Headers' => ['Authorization', 'Content-Type'],
                'Access-Control-Allow-Credentials' => true,
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
        Yii::$app->response->headers->set('Cache-Control', 'no-store');
        Yii::$app->response->headers->set('X-Content-Type-Options', 'nosniff');

        if (in_array($action->id, ['refresh', 'logout'], true)) {
            $origin = Yii::$app->request->headers->get('Origin');
            if ($origin !== null && $origin !== Yii::$app->params['auth']['allowedOrigin']) {
                throw new UnauthorizedHttpException('Request origin is not allowed.');
            }
        }

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

        $response = $this->authService->login($login, $password, (string) Yii::$app->request->userIP);
        $this->setRefreshCookie($response['refreshToken'], $response['refreshTokenExpiresAt']);
        unset($response['refreshToken'], $response['refreshTokenExpiresAt'], $response['refreshTokenId']);

        return $response;
    }

    public function actionRefresh(): array
    {
        $response = $this->authService->refresh($this->refreshTokenFromCookie());
        $this->setRefreshCookie($response['refreshToken'], $response['refreshTokenExpiresAt']);
        unset($response['refreshToken'], $response['refreshTokenExpiresAt'], $response['refreshTokenId']);

        return $response;
    }

    public function actionLogout(): array
    {
        $refreshToken = Yii::$app->request->cookies->getValue($this->refreshCookieName());
        if (is_string($refreshToken) && $refreshToken !== '') {
            $this->authService->logout($refreshToken);
        }
        $this->clearRefreshCookie();

        return ['success' => true];
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

    private function refreshTokenFromCookie(): string
    {
        $refreshToken = Yii::$app->request->cookies->getValue($this->refreshCookieName());

        if (!is_string($refreshToken) || $refreshToken === '') {
            throw new UnauthorizedHttpException('Refresh cookie is required.');
        }

        return $refreshToken;
    }

    private function setRefreshCookie(string $token, string $expiresAt): void
    {
        Yii::$app->response->cookies->add(new Cookie([
            'name' => $this->refreshCookieName(),
            'value' => $token,
            'httpOnly' => true,
            'secure' => (bool) Yii::$app->params['auth']['refreshCookieSecure'],
            'sameSite' => Cookie::SAME_SITE_STRICT,
            'path' => '/api/v1/auth',
            'expire' => strtotime($expiresAt),
        ]));
    }

    private function clearRefreshCookie(): void
    {
        Yii::$app->response->cookies->remove(new Cookie([
            'name' => $this->refreshCookieName(),
            'path' => '/api/v1/auth',
        ]));
    }

    private function refreshCookieName(): string
    {
        return (string) Yii::$app->params['auth']['refreshCookieName'];
    }
}
