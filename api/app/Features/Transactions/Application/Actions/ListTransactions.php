<?php

declare(strict_types=1);

namespace App\Features\Transactions\Application\Actions;

use App\Models\Transaction;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class ListTransactions
{
    /** @param array<string, mixed> $filters @return LengthAwarePaginator<Transaction> */
    public function handle(User $user, array $filters): LengthAwarePaginator
    {
        $query = $user->transactions()->with(['category', 'entries.account']);
        if ($filters['status'] === 'deleted') $query->onlyTrashed();
        if (isset($filters['type'])) $query->where('type', $filters['type']);
        if (isset($filters['category_id'])) $query->where('category_id', $filters['category_id']);
        if (isset($filters['account_id'])) $query->whereHas('entries', fn ($entry) => $entry->where('account_id', $filters['account_id']));
        if (isset($filters['date_from'])) $query->whereDate('transaction_date', '>=', $filters['date_from']);
        if (isset($filters['date_to'])) $query->whereDate('transaction_date', '<=', $filters['date_to']);
        if (isset($filters['search'])) {
            $search = '%'.trim((string) $filters['search']).'%';
            $query->where(fn ($nested) => $nested->where('description', 'like', $search)->orWhere('notes', 'like', $search));
        }
        return $query->orderByDesc('transaction_date')->orderByDesc('id')->paginate(25)->withQueryString();
    }
}
