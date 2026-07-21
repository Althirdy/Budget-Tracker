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

        return $user->budgets()
            ->with('category')
            ->whereDate('period', $periodDate)
            ->get()
            ->sortBy('category.name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();
    }
}
