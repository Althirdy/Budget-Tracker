<?php

declare(strict_types=1);

namespace App\Features\Budgets\Application\Actions;

use App\Models\Budget;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;

final class ListBudgets
{
    /** @return Collection<int, Budget> */
    public function handle(User $user, string $period): Collection
    {
        $periodDate = CarbonImmutable::createFromFormat('!Y-m', $period)->toDateString();

        $budgets = $user->budgets()
            ->with('category')
            ->whereDate('period', $periodDate)
            ->get()
            ->sortBy('category.name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        $start = CarbonImmutable::parse($periodDate)->startOfMonth();
        $spentByCategory = $user->transactions()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$start->toDateString(), $start->endOfMonth()->toDateString()])
            ->selectRaw('category_id, SUM(amount) as spent_total')
            ->groupBy('category_id')
            ->pluck('spent_total', 'category_id');

        return $budgets->each(fn (Budget $budget) => $budget->setAttribute('spent_total', (string) ($spentByCategory[$budget->category_id] ?? '0.00')));
    }
}
