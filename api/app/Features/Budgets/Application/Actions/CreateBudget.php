<?php

declare(strict_types=1);

namespace App\Features\Budgets\Application\Actions;

use App\Models\Budget;
use App\Models\User;
use Carbon\CarbonImmutable;

final class CreateBudget
{
    /** @param array{category_id: int, period: string, amount: string} $data */
    public function handle(User $user, array $data): Budget
    {
        $budget = $user->budgets()->create([
            'category_id' => $data['category_id'],
            'period' => CarbonImmutable::createFromFormat('!Y-m', $data['period'])->toDateString(),
            'amount' => $data['amount'],
            'currency' => 'PHP',
        ]);

        return $budget->load('category');
    }
}
