<?php

declare(strict_types=1);

namespace app\modules\auth\resources;

use app\models\User;

class UserResource
{
    public static function toArray(User $user): array
    {
        return [
            'id' => $user->id,
            'email' => $user->email,
            'username' => $user->username,
            'firstName' => $user->first_name,
            'lastName' => $user->last_name,
            'role' => (int) $user->role,
            'roleName' => $user->getRoleName(),
        ];
    }
}
