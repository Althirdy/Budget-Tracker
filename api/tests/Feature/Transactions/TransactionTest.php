<?php

declare(strict_types=1);

namespace Tests\Feature\Transactions;

use App\Models\Account;
use App\Models\Category;
use App\Models\User;
use Database\Seeders\LocalDevelopmentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class TransactionTest extends TestCase
{
    use RefreshDatabase;

    private function regular(User $user, string $type = 'expense'): array
    {
        $account = Account::factory()->for($user)->create(['opening_balance' => '1000.00']);
        $category = Category::factory()->for($user)->create(['type' => $type]);
        return ['type' => $type, 'account_id' => $account->id, 'category_id' => $category->id, 'amount' => '100.00', 'transaction_date' => today()->toDateString(), 'description' => 'Test transaction', 'notes' => null];
    }

    public function test_guest_cannot_access_transactions(): void
    { $this->getJson('/api/v1/transactions')->assertUnauthorized(); $this->postJson('/api/v1/transactions', [])->assertUnauthorized(); }

    public function test_user_can_create_update_list_delete_and_restore_an_expense(): void
    {
        $user = User::factory()->create(); $payload = $this->regular($user); $this->actingAs($user);
        $id = $this->postJson('/api/v1/transactions', $payload)->assertCreated()->assertJsonPath('data.type', 'expense')->json('data.id');
        $this->getJson('/api/v1/transactions')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('meta.per_page', 25);
        $this->putJson("/api/v1/transactions/{$id}", [...$payload, 'amount' => '125.50'])->assertOk()->assertJsonPath('data.amount', '125.50');
        $this->deleteJson("/api/v1/transactions/{$id}")->assertNoContent();
        $this->getJson('/api/v1/transactions')->assertJsonCount(0, 'data');
        $this->getJson('/api/v1/transactions?status=deleted')->assertJsonCount(1, 'data');
        $this->postJson("/api/v1/transactions/{$id}/restore")->assertOk()->assertJsonPath('data.is_deleted', false);
    }

    public function test_transfer_creates_two_entries_and_updates_asset_balances(): void
    {
        $user = User::factory()->create();
        $source = Account::factory()->for($user)->create(['name' => 'Source', 'opening_balance' => '1000.00']);
        $destination = Account::factory()->for($user)->create(['name' => 'Destination', 'opening_balance' => '500.00']);
        $this->actingAs($user);
        $id = $this->postJson('/api/v1/transactions', ['type' => 'transfer', 'source_account_id' => $source->id, 'destination_account_id' => $destination->id, 'amount' => '200.00', 'transaction_date' => today()->toDateString(), 'description' => 'Transfer funds'])->assertCreated()->assertJsonPath('data.source_account.id', $source->id)->json('data.id');
        $this->assertDatabaseCount('transaction_entries', 2);
        $this->assertDatabaseHas('transaction_entries', ['transaction_id' => $id, 'account_id' => $source->id, 'balance_delta' => '-200.00']);
        $this->getJson('/api/v1/accounts')->assertJsonFragment(['name' => 'Source', 'current_balance' => '800.00'])->assertJsonFragment(['name' => 'Destination', 'current_balance' => '700.00']);
    }

    public function test_credit_card_purchase_increases_debt_and_payment_reduces_it(): void
    {
        $user = User::factory()->create();
        $card = Account::factory()->for($user)->create(['name' => 'Card', 'type' => 'credit-card', 'opening_balance' => '500.00']);
        $cash = Account::factory()->for($user)->create(['name' => 'Cash', 'opening_balance' => '1000.00']);
        $category = Category::factory()->for($user)->create(['type' => 'expense']); $this->actingAs($user);
        $this->postJson('/api/v1/transactions', ['type' => 'expense', 'account_id' => $card->id, 'category_id' => $category->id, 'amount' => '100.00', 'transaction_date' => today()->toDateString(), 'description' => 'Card purchase'])->assertCreated();
        $this->postJson('/api/v1/transactions', ['type' => 'transfer', 'source_account_id' => $cash->id, 'destination_account_id' => $card->id, 'amount' => '200.00', 'transaction_date' => today()->toDateString(), 'description' => 'Card payment'])->assertCreated();
        $this->getJson('/api/v1/accounts')->assertJsonFragment(['name' => 'Card', 'current_balance' => '400.00']);
    }

    public function test_validation_enforces_ownership_category_type_accounts_and_date(): void
    {
        $user = User::factory()->create(); $other = User::factory()->create(); $payload = $this->regular($user); $foreign = Account::factory()->for($other)->create(); $this->actingAs($user);
        $this->postJson('/api/v1/transactions', [...$payload, 'account_id' => $foreign->id, 'transaction_date' => today()->addDay()->toDateString(), 'amount' => '-1'])->assertUnprocessable()->assertJsonValidationErrors(['account_id', 'transaction_date', 'amount']);
        $this->postJson('/api/v1/transactions', [...$payload, 'type' => 'income'])->assertUnprocessable()->assertJsonValidationErrors('category_id');
        $this->postJson('/api/v1/transactions', ['type' => 'transfer', 'source_account_id' => $payload['account_id'], 'destination_account_id' => $payload['account_id'], 'amount' => '1.00', 'transaction_date' => today()->toDateString(), 'description' => 'Invalid transfer'])->assertUnprocessable()->assertJsonValidationErrors('destination_account_id');
    }

    public function test_user_cannot_mutate_another_users_transaction(): void
    {
        $owner = User::factory()->create(); $payload = $this->regular($owner); $this->actingAs($owner);
        $id = $this->postJson('/api/v1/transactions', $payload)->assertCreated()->json('data.id');
        $other = User::factory()->create(); $otherPayload = $this->regular($other); $this->actingAs($other);
        $this->putJson("/api/v1/transactions/{$id}", $otherPayload)->assertNotFound();
        $this->deleteJson("/api/v1/transactions/{$id}")->assertNotFound();
    }

    public function test_budget_progress_excludes_deleted_expenses(): void
    {
        $user = User::factory()->create(); $payload = $this->regular($user); $this->actingAs($user);
        $budgetId = $this->postJson('/api/v1/budgets', ['category_id' => $payload['category_id'], 'period' => today()->format('Y-m'), 'amount' => '500.00'])->assertCreated()->json('data.id');
        $transactionId = $this->postJson('/api/v1/transactions', $payload)->assertCreated()->json('data.id');
        $this->getJson('/api/v1/budgets?period='.today()->format('Y-m'))->assertJsonPath('data.0.spent', '100.00')->assertJsonPath('data.0.remaining', '400.00')->assertJsonPath('data.0.progress_percentage', '20.00');
        $this->deleteJson("/api/v1/transactions/{$transactionId}")->assertNoContent();
        $this->getJson('/api/v1/budgets?period='.today()->format('Y-m'))->assertJsonPath('data.0.id', $budgetId)->assertJsonPath('data.0.spent', '0.00');
    }

    public function test_seeder_is_idempotent(): void
    { $this->seed(LocalDevelopmentSeeder::class); $this->seed(LocalDevelopmentSeeder::class); $this->assertDatabaseCount('transactions', 4); $this->assertDatabaseCount('transaction_entries', 5); }
}
