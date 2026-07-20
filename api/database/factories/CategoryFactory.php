<?php

namespace Database\Factories;

use App\Features\Categories\Domain\CategoryIcon;
use App\Features\Categories\Domain\CategoryType;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Category> */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->unique()->word(),
            'type' => fake()->randomElement(CategoryType::cases()),
            'color' => fake()->hexColor(),
            'icon' => fake()->randomElement(CategoryIcon::cases())->value,
        ];
    }
}
