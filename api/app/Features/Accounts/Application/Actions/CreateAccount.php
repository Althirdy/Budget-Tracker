<?php

declare(strict_types=1);

namespace App\Features\Accounts\Application\Actions;

use App\Models\Account;
use App\Models\User;

final class CreateAccount
{
    /** @param array{name: string, type: string, opening_balance: string, color: string, icon: string} $data */
    public function handle(User $user, array $data): Account
    {
        return $user->accounts()->create([...$data, 'currency' => 'PHP']);
    }
}
