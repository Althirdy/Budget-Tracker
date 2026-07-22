<?php

declare(strict_types=1);

namespace App\Features\Accounts\Application\Actions;

use App\Models\Account;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

final class ListAccounts
{
    /**
     * @param array{status: string, type?: string, search?: string} $filters
     * @return Collection<int, Account>
     */
    public function handle(User $user, array $filters): Collection
    {
        $query = $user->accounts();

        if ($filters['status'] === 'archived') {
            $query->onlyTrashed();
        } elseif ($filters['status'] === 'all') {
            $query->withTrashed();
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['search'])) {
            $query->where('name', 'like', '%'.$filters['search'].'%');
        }

        return $query
            ->withSum(['transactionEntries as ledger_total' => fn ($entries) => $entries
                ->whereHas('transaction', fn ($transaction) => $transaction->whereDate('transaction_date', '<=', today()))], 'balance_delta')
            ->orderBy('type')->orderBy('name')->get();
    }
}
