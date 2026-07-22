<?php

declare(strict_types=1);

namespace App\Features\Transactions\Application\Actions;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class RestoreTransaction
{
    public function handle(User $user, int $id): Transaction
    {
        return DB::transaction(function () use ($user, $id): Transaction {
            $transaction = $user->transactions()->onlyTrashed()->findOrFail($id);
            $transaction->restore();
            return $transaction->load(['category', 'entries.account']);
        });
    }
}
