<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

final class LocalDevelopmentSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ],
        );

        $categories = [
            ['name' => 'Salary', 'type' => 'income', 'color' => '#22C55E', 'icon' => 'banknote'],
            ['name' => 'Freelance', 'type' => 'income', 'color' => '#14B8A6', 'icon' => 'briefcase-business'],
            ['name' => 'Groceries', 'type' => 'expense', 'color' => '#F97316', 'icon' => 'shopping-cart'],
            ['name' => 'Housing', 'type' => 'expense', 'color' => '#8B5CF6', 'icon' => 'house'],
            ['name' => 'Transport', 'type' => 'expense', 'color' => '#3B82F6', 'icon' => 'car'],
            ['name' => 'Utilities', 'type' => 'expense', 'color' => '#EAB308', 'icon' => 'receipt'],
        ];

        foreach ($categories as $category) {
            Category::withTrashed()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'name' => $category['name'],
                    'type' => $category['type'],
                ],
                [
                    'color' => $category['color'],
                    'icon' => $category['icon'],
                    'deleted_at' => null,
                ],
            );
        }

        $budgetAmounts = [
            'Groceries' => '8000.00',
            'Housing' => '15000.00',
            'Transport' => '5000.00',
            'Utilities' => '4000.00',
        ];

        foreach ($budgetAmounts as $categoryName => $amount) {
            $category = $user->categories()
                ->where('name', $categoryName)
                ->where('type', 'expense')
                ->firstOrFail();

            Budget::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'category_id' => $category->id,
                    'period' => now()->startOfMonth()->toDateString(),
                ],
                [
                    'amount' => $amount,
                    'currency' => 'PHP',
                ],
            );
        }

        $accounts = [
            ['name' => 'Cash Wallet', 'type' => 'cash', 'opening_balance' => '2500.00', 'color' => '#F97316', 'icon' => 'wallet'],
            ['name' => 'Checking Account', 'type' => 'checking', 'opening_balance' => '25000.00', 'color' => '#3B82F6', 'icon' => 'landmark'],
            ['name' => 'Savings', 'type' => 'savings', 'opening_balance' => '75000.00', 'color' => '#22C55E', 'icon' => 'piggy-bank'],
            ['name' => 'GCash', 'type' => 'e-wallet', 'opening_balance' => '1500.00', 'color' => '#06B6D4', 'icon' => 'smartphone'],
            ['name' => 'Credit Card', 'type' => 'credit-card', 'opening_balance' => '5000.00', 'color' => '#EF4444', 'icon' => 'credit-card'],
        ];

        foreach ($accounts as $account) {
            Account::withTrashed()->updateOrCreate(
                ['user_id' => $user->id, 'name' => $account['name']],
                [...$account, 'currency' => 'PHP', 'deleted_at' => null],
            );
        }
    }
}
