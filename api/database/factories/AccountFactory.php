<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Features\Accounts\Domain\AccountType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<\App\Models\Account> */
final class AccountFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->words(2, true),
            'type' => AccountType::Cash,
            'opening_balance' => fake()->randomFloat(2, 0, 100000),
            'currency' => 'PHP',
            'color' => '#3B82F6',
            'icon' => 'wallet',
        ];
    }
}
