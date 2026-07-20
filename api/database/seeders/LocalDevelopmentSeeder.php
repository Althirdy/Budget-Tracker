<?php

namespace Database\Seeders;

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
    }
}
