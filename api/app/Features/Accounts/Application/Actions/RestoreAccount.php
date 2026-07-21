<?php

declare(strict_types=1);

namespace App\Features\Accounts\Application\Actions;

use App\Models\Account;
use App\Models\User;
use Illuminate\Validation\ValidationException;

final class RestoreAccount
{
    public function handle(User $user, int $accountId): Account
    {
        $account = $user->accounts()->onlyTrashed()->findOrFail($accountId);

        $duplicateExists = $user->accounts()
            ->where('name', $account->name)
            ->exists();

        if ($duplicateExists) {
            throw ValidationException::withMessages([
                'name' => ['An active account with this name already exists.'],
            ]);
        }

        $account->restore();

        return $account->refresh();
    }
}
