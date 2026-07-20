<?php

declare(strict_types=1);

namespace Tests\Feature\Categories;

use App\Models\Category;
use App\Models\User;
use Database\Seeders\LocalDevelopmentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_categories(): void
    {
        $this->getJson('/api/v1/categories')->assertUnauthorized();
        $this->postJson('/api/v1/categories', [])->assertUnauthorized();
    }

    public function test_user_can_create_list_and_update_a_category(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $categoryId = $this->postJson('/api/v1/categories', [
            'name' => '  Groceries  ',
            'type' => 'expense',
            'color' => '#f97316',
            'icon' => 'shopping-cart',
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Groceries')
            ->assertJsonPath('data.color', '#F97316')
            ->json('data.id');

        $this->getJson('/api/v1/categories')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $categoryId);

        $this->putJson("/api/v1/categories/{$categoryId}", [
            'name' => 'Food',
            'type' => 'expense',
            'color' => '#EF4444',
            'icon' => 'utensils',
        ])->assertOk()
            ->assertJsonPath('data.name', 'Food')
            ->assertJsonPath('data.icon', 'utensils');

        $this->assertDatabaseHas('categories', [
            'id' => $categoryId,
            'user_id' => $user->id,
            'name' => 'Food',
        ]);
    }

    public function test_list_supports_status_type_and_search_filters(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Category::factory()->for($user)->create(['name' => 'Salary', 'type' => 'income']);
        Category::factory()->for($user)->create(['name' => 'Groceries', 'type' => 'expense']);
        $archived = Category::factory()->for($user)->create(['name' => 'Old Grocery', 'type' => 'expense']);
        $archived->delete();

        $this->getJson('/api/v1/categories?type=expense&search=Groc')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Groceries');

        $this->getJson('/api/v1/categories?status=archived')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_archived', true);

        $this->getJson('/api/v1/categories?status=all')->assertJsonCount(3, 'data');
    }

    public function test_user_can_archive_and_restore_a_category(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->for($user)->create();
        $this->actingAs($user);

        $this->deleteJson("/api/v1/categories/{$category->id}")->assertNoContent();
        $this->assertSoftDeleted($category);
        $this->getJson('/api/v1/categories')->assertJsonCount(0, 'data');

        $this->postJson("/api/v1/categories/{$category->id}/restore")
            ->assertOk()
            ->assertJsonPath('data.is_archived', false);

        $this->assertNotSoftDeleted($category);
    }

    public function test_user_cannot_mutate_another_users_category(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = Category::factory()->for($owner)->create();
        $this->actingAs($otherUser);

        $payload = ['name' => 'Changed', 'type' => 'expense', 'color' => '#123456', 'icon' => 'gift'];

        $this->putJson("/api/v1/categories/{$category->id}", $payload)->assertNotFound();
        $this->deleteJson("/api/v1/categories/{$category->id}")->assertNotFound();
        $category->delete();
        $this->postJson("/api/v1/categories/{$category->id}/restore")->assertNotFound();
    }

    public function test_category_validation_and_duplicate_rules(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        Category::factory()->for($user)->create(['name' => 'Other', 'type' => 'expense']);

        $this->postJson('/api/v1/categories', [
            'name' => 'Other', 'type' => 'expense', 'color' => 'orange', 'icon' => 'unknown',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'color', 'icon']);

        $this->postJson('/api/v1/categories', [
            'name' => 'Other', 'type' => 'income', 'color' => '#22C55E', 'icon' => 'banknote',
        ])->assertCreated();

        $this->postJson('/api/v1/categories', [
            'name' => 'X', 'type' => 'transfer', 'color' => '#123456', 'icon' => 'gift',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'type']);
    }

    public function test_restore_rejects_an_active_name_and_type_collision(): void
    {
        $user = User::factory()->create();
        $archived = Category::factory()->for($user)->create(['name' => 'Other', 'type' => 'expense']);
        $archived->delete();
        Category::factory()->for($user)->create(['name' => 'Other', 'type' => 'expense']);
        $this->actingAs($user);

        $this->postJson("/api/v1/categories/{$archived->id}/restore")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_local_development_seeder_is_idempotent(): void
    {
        $this->seed(LocalDevelopmentSeeder::class);
        $this->seed(LocalDevelopmentSeeder::class);

        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('categories', 6);
        $this->assertDatabaseHas('categories', ['name' => 'Groceries', 'type' => 'expense']);
    }
}
