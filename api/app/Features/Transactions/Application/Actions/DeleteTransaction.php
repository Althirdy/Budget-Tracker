<?php

declare(strict_types=1);

namespace App\Features\Transactions\Application\Actions;

use App\Models\User;
use Illuminate\Support\Facades\DB;

final class DeleteTransaction
{
    public function handle(User $user, int $id): void
    {
        DB::transaction(fn () => $user->transactions()->findOrFail($id)->delete());
    }
}
