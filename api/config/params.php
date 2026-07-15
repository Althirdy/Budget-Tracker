<?php

$isProduction = defined('YII_ENV_PROD') && YII_ENV_PROD;
$jwtSecret = getenv('JWT_SECRET') ?: ($isProduction ? '' : 'local-development-jwt-secret-change-me');
$cookieValidationKey = getenv('COOKIE_VALIDATION_KEY') ?: ($isProduction ? '' : 'local-development-cookie-key-change-me');

if ($isProduction && (strlen($jwtSecret) < 32 || strlen($cookieValidationKey) < 32)) {
    throw new RuntimeException('JWT_SECRET and COOKIE_VALIDATION_KEY must each contain at least 32 characters.');
}

return [
    'adminEmail' => 'admin@example.com',
    'senderEmail' => 'noreply@example.com',
    'senderName' => 'Example.com mailer',
    'jwt' => [
        'secret' => $jwtSecret,
        'issuer' => getenv('JWT_ISSUER') ?: 'budget-tracker-api',
        'audience' => getenv('JWT_AUDIENCE') ?: 'budget-tracker-frontend',
        'accessTokenTtl' => 900,
        'refreshTokenTtl' => 7200,
    ],
    'auth' => [
        'allowedOrigin' => getenv('FRONTEND_ORIGIN') ?: 'http://localhost:5173',
        'refreshCookieName' => 'budget_refresh',
        'refreshCookieSecure' => $isProduction,
        'loginWindowSeconds' => 900,
        'loginAccountLimit' => 5,
        'loginIpLimit' => 30,
    ],
    'cookieValidationKey' => $cookieValidationKey,
];
