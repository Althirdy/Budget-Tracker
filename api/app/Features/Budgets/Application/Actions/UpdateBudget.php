<?php

declare(strict_types=1);

namespace App\Features\Budgets\Application\Actions;

use App\Models\Budget;
use App\Models\User;

final class UpdateBudget
{
    public function handle(User $user, int $budgetId, string $amount): Budget
    {
        $budget = $user->budgets()->findOrFail($budgetId);
        $budget->update(['amount' => $amount]);

        return $budget->refresh()->load('category');
    }
}
