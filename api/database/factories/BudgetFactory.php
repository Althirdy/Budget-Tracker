<?php

namespace Database\Factories;

use App\Features\Categories\Domain\CategoryType;
use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Budget> */
class BudgetFactory extends Factory
{
    protected $model = Budget::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => fn (array $attributes): int => Category::factory()->create([
                'user_id' => $attributes['user_id'],
                'type' => CategoryType::Expense,
            ])->id,
            'period' => now()->startOfMonth()->toDateString(),
            'amount' => fake()->randomFloat(2, 100, 50000),
            'currency' => 'PHP',
        ];
    }
}
