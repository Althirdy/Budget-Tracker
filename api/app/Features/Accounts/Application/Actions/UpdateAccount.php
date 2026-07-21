<?php

declare(strict_types=1);

namespace App\Features\Accounts\Application\Actions;

use App\Models\Account;
use App\Models\User;

final class UpdateAccount
{
    /** @param array{name: string, type: string, opening_balance: string, color: string, icon: string} $data */
    public function handle(User $user, int $accountId, array $data): Account
    {
        $account = $user->accounts()->findOrFail($accountId);
        $account->update($data);

        return $account->refresh();
    }
}
