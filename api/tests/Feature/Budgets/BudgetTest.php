<?php

declare(strict_types=1);

namespace Tests\Feature\Budgets;

use App\Features\Categories\Domain\CategoryType;
use App\Models\Budget;
use App\Models\Category;
use App\Models\User;
use Database\Seeders\LocalDevelopmentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class BudgetTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_budgets(): void
    {
        $this->getJson('/api/v1/budgets')->assertUnauthorized();
        $this->postJson('/api/v1/budgets', [])->assertUnauthorized();
    }

    public function test_user_can_create_list_update_and_delete_a_budget(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->for($user)->create(['name' => 'Groceries', 'type' => CategoryType::Expense]);
        $this->actingAs($user);

        $budgetId = $this->postJson('/api/v1/budgets', [
            'category_id' => $category->id,
            'period' => '2026-07',
            'amount' => '5000.00',
        ])->assertCreated()
            ->assertJsonPath('data.period', '2026-07')
            ->assertJsonPath('data.amount', '5000.00')
            ->assertJsonPath('data.currency', 'PHP')
            ->assertJsonPath('data.category.name', 'Groceries')
            ->json('data.id');

        $this->getJson('/api/v1/budgets?period=2026-07')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.planned_total', '5000.00')
            ->assertJsonPath('meta.period', '2026-07');

        $this->putJson("/api/v1/budgets/{$budgetId}", ['amount' => '6250.50'])
            ->assertOk()
            ->assertJsonPath('data.amount', '6250.50');

        $this->deleteJson("/api/v1/budgets/{$budgetId}")->assertNoContent();
        $this->assertDatabaseMissing('budgets', ['id' => $budgetId]);
    }

    public function test_one_user_has_many_budgets_and_category_has_many_across_months(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->for($user)->create(['type' => CategoryType::Expense]);

        $user->budgets()->createMany([
            ['category_id' => $category->id, 'period' => '2026-07-01', 'amount' => '1000.00', 'currency' => 'PHP'],
            ['category_id' => $category->id, 'period' => '2026-08-01', 'amount' => '1200.00', 'currency' => 'PHP'],
        ]);

        $this->assertCount(2, $user->budgets);
        $this->assertCount(2, $category->budgets);
        $this->assertTrue($category->budgets->every(fn (Budget $budget): bool => $budget->user_id === $user->id));
    }

    public function test_budget_requires_an_active_owned_expense_category(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $income = Category::factory()->for($user)->create(['type' => CategoryType::Income]);
        $archived = Category::factory()->for($user)->create(['type' => CategoryType::Expense]);
        $archived->delete();
        $otherCategory = Category::factory()->for($otherUser)->create(['type' => CategoryType::Expense]);
        $this->actingAs($user);

        foreach ([$income->id, $archived->id, $otherCategory->id] as $categoryId) {
            $this->postJson('/api/v1/budgets', [
                'category_id' => $categoryId,
                'period' => '2026-07',
                'amount' => '1000.00',
            ])->assertUnprocessable()->assertJsonValidationErrors('category_id');
        }
    }

    public function test_category_can_only_be_budgeted_once_per_user_and_month(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->for($user)->create(['type' => CategoryType::Expense]);
        $this->actingAs($user);

        $payload = ['category_id' => $category->id, 'period' => '2026-07', 'amount' => '1000.00'];
        $this->postJson('/api/v1/budgets', $payload)->assertCreated();
        $this->postJson('/api/v1/budgets', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('category_id');

        $this->postJson('/api/v1/budgets', [...$payload, 'period' => '2026-08'])->assertCreated();
    }

    public function test_period_and_amount_are_validated(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->for($user)->create(['type' => CategoryType::Expense]);
        $this->actingAs($user);

        $this->postJson('/api/v1/budgets', [
            'category_id' => $category->id,
            'period' => 'July 2026',
            'amount' => '0',
        ])->assertUnprocessable()->assertJsonValidationErrors(['period', 'amount']);

        $this->getJson('/api/v1/budgets?period=invalid')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('period');
    }

    public function test_archived_category_is_retained_in_historical_budget_response(): void
    {
        $user = User::factory()->create();
        $category = Category::factory()->for($user)->create(['name' => 'Old Category', 'type' => CategoryType::Expense]);
        $budget = $user->budgets()->create([
            'category_id' => $category->id,
            'period' => '2026-07-01',
            'amount' => '1000.00',
            'currency' => 'PHP',
        ]);
        $category->delete();
        $this->actingAs($user);

        $this->getJson('/api/v1/budgets?period=2026-07')
            ->assertOk()
            ->assertJsonPath('data.0.id', $budget->id)
            ->assertJsonPath('data.0.category.name', 'Old Category')
            ->assertJsonPath('data.0.category.is_archived', true);
    }

    public function test_user_cannot_update_or_delete_another_users_budget(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $category = Category::factory()->for($owner)->create(['type' => CategoryType::Expense]);
        $budget = $owner->budgets()->create([
            'category_id' => $category->id,
            'period' => '2026-07-01',
            'amount' => '1000.00',
            'currency' => 'PHP',
        ]);
        $this->actingAs($otherUser);

        $this->putJson("/api/v1/budgets/{$budget->id}", ['amount' => '500.00'])->assertNotFound();
        $this->deleteJson("/api/v1/budgets/{$budget->id}")->assertNotFound();
    }

    public function test_local_development_budget_seeding_is_idempotent(): void
    {
        $this->seed(LocalDevelopmentSeeder::class);
        $this->seed(LocalDevelopmentSeeder::class);

        $this->assertDatabaseCount('budgets', 4);
        $this->assertDatabaseHas('budgets', ['amount' => '8000.00', 'currency' => 'PHP']);
    }
}
