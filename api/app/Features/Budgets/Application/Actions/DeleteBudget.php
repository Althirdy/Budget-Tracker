<?php

declare(strict_types=1);

namespace App\Features\Budgets\Application\Actions;

use App\Models\User;

final class DeleteBudget
{
    public function handle(User $user, int $budgetId): void
    {
        $user->budgets()->findOrFail($budgetId)->delete();
    }
}
