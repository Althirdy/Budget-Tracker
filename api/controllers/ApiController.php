<?php

declare(strict_types=1);

namespace app\controllers;

use Yii;
use yii\filters\VerbFilter;
use yii\rest\Controller;
use yii\web\Response;

class ApiController extends Controller
{
    public function behaviors(): array
    {
        $behaviors = parent::behaviors();
        $behaviors['verbs'] = [
            'class' => VerbFilter::class,
            'actions' => [
                'health' => ['GET'],
            ],
        ];

        return $behaviors;
    }

    public function actionHealth(): array
    {
        Yii::$app->response->format = Response::FORMAT_JSON;

        return [
            'status' => 'ok',
            'service' => 'budget-tracker-api',
            'version' => 'v1',
        ];
    }
}
