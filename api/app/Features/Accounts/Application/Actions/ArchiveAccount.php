<?php

declare(strict_types=1);

namespace App\Features\Accounts\Application\Actions;

use App\Models\User;

final class ArchiveAccount
{
    public function handle(User $user, int $accountId): void
    {
        $user->accounts()->findOrFail($accountId)->delete();
    }
}
