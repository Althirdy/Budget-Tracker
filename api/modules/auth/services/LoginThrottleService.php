<?php

declare(strict_types=1);

namespace app\modules\auth\services;

use Yii;
use yii\web\TooManyRequestsHttpException;

final class LoginThrottleService
{
    public function assertAllowed(string $login, string $ipAddress): void
    {
        $this->assertBucketAllowed($this->accountKey($login), $this->accountLimit());
        $this->assertBucketAllowed($this->ipKey($ipAddress), $this->ipLimit());
    }

    public function recordFailure(string $login, string $ipAddress): void
    {
        $this->record($this->accountKey($login));
        $this->record($this->ipKey($ipAddress));
    }

    public function clearAccount(string $login): void
    {
        Yii::$app->cache->delete($this->accountKey($login));
    }

    private function assertBucketAllowed(string $key, int $limit): void
    {
        if (count($this->recentAttempts($key)) >= $limit) {
            throw new TooManyRequestsHttpException('Too many login attempts. Please try again later.');
        }
    }

    private function record(string $key): void
    {
        $attempts = $this->recentAttempts($key);
        $attempts[] = time();
        Yii::$app->cache->set($key, $attempts, $this->window());
    }

    private function recentAttempts(string $key): array
    {
        $attempts = Yii::$app->cache->get($key);
        $cutoff = time() - $this->window();

        return array_values(array_filter(is_array($attempts) ? $attempts : [], static fn ($time) => $time > $cutoff));
    }

    private function accountKey(string $login): string
    {
        return 'auth:login:account:' . hash('sha256', mb_strtolower(trim($login)));
    }

    private function ipKey(string $ipAddress): string
    {
        return 'auth:login:ip:' . hash('sha256', $ipAddress);
    }

    private function window(): int
    {
        return (int) Yii::$app->params['auth']['loginWindowSeconds'];
    }

    private function accountLimit(): int
    {
        return (int) Yii::$app->params['auth']['loginAccountLimit'];
    }

    private function ipLimit(): int
    {
        return (int) Yii::$app->params['auth']['loginIpLimit'];
    }
}
