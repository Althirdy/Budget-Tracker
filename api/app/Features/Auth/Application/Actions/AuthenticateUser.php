<?php

declare(strict_types=1);

namespace App\Features\Auth\Application\Actions;

use App\Models\User;
use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Support\Facades\Auth;
use LogicException;

final class AuthenticateUser
{
    /**
     * @param  array{email: string, password: string}  $credentials
     */
    public function handle(array $credentials): ?User
    {
        $guard = Auth::guard('web');
        if (! $guard instanceof StatefulGuard) {
            throw new LogicException('The web authentication guard must be stateful.');
        }

        if (! $guard->attempt($credentials)) {
            return null;
        }

        $user = $guard->user();

        return $user instanceof User ? $user : null;
    }
}
