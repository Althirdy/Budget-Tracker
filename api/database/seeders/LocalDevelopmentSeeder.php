<?php

namespace Database\Seeders;

use App\Models\Account;
use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use App\Features\Transactions\Application\Services\TransactionWriter;
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

        $writer = app(TransactionWriter::class);
        $transactions = [
            ['type' => 'income', 'account' => 'Checking Account', 'category' => 'Salary', 'amount' => '45000.00', 'description' => 'Monthly salary'],
            ['type' => 'expense', 'account' => 'Cash Wallet', 'category' => 'Groceries', 'amount' => '1800.00', 'description' => 'Weekly groceries'],
            ['type' => 'expense', 'account' => 'Credit Card', 'category' => 'Utilities', 'amount' => '2200.00', 'description' => 'Internet bill'],
        ];

        foreach ($transactions as $data) {
            $transaction = $user->transactions()->withTrashed()->firstOrNew([
                'description' => $data['description'],
                'transaction_date' => now()->startOfMonth()->addDays(2)->toDateString(),
            ]);
            if ($transaction->trashed()) $transaction->restore();
            $writer->fill($user, $transaction, [
                'type' => $data['type'], 'amount' => $data['amount'],
                'transaction_date' => now()->startOfMonth()->addDays(2)->toDateString(),
                'description' => $data['description'], 'notes' => null,
                'account_id' => $user->accounts()->where('name', $data['account'])->firstOrFail()->id,
                'category_id' => $user->categories()->where('name', $data['category'])->firstOrFail()->id,
            ]);
        }

        $transfer = $user->transactions()->withTrashed()->firstOrNew([
            'description' => 'Move money to savings',
            'transaction_date' => now()->startOfMonth()->addDays(3)->toDateString(),
        ]);
        if ($transfer->trashed()) $transfer->restore();
        $writer->fill($user, $transfer, [
            'type' => 'transfer', 'amount' => '5000.00',
            'transaction_date' => now()->startOfMonth()->addDays(3)->toDateString(),
            'description' => 'Move money to savings', 'notes' => null,
            'source_account_id' => $user->accounts()->where('name', 'Checking Account')->firstOrFail()->id,
            'destination_account_id' => $user->accounts()->where('name', 'Savings')->firstOrFail()->id,
        ]);
    }
}
