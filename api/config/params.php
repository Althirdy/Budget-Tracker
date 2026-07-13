<?php

return [
    'adminEmail' => 'admin@example.com',
    'senderEmail' => 'noreply@example.com',
    'senderName' => 'Example.com mailer',
    'jwt' => [
        'secret' => 'local-development-jwt-secret-change-me',
        'accessTokenTtl' => 900,
        'refreshTokenTtl' => 7200,
    ],
];
