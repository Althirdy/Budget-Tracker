<?php

declare(strict_types=1);

namespace Tests\Feature\Accounts;

use App\Models\Account;
use App\Models\User;
use Database\Seeders\LocalDevelopmentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class AccountTest extends TestCase
{
    use RefreshDatabase;

    private const PAYLOAD = [
        'name' => 'Cash Wallet',
        'type' => 'cash',
        'opening_balance' => '2500.00',
        'color' => '#F97316',
        'icon' => 'wallet',
    ];

    public function test_guests_cannot_access_accounts(): void
    {
        $this->getJson('/api/v1/accounts')->assertUnauthorized();
        $this->postJson('/api/v1/accounts', self::PAYLOAD)->assertUnauthorized();
    }

    public function test_user_can_create_list_and_update_an_account(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $id = $this->postJson('/api/v1/accounts', [...self::PAYLOAD, 'name' => '  Cash Wallet  '])
            ->assertCreated()->assertJsonPath('data.name', 'Cash Wallet')
            ->assertJsonPath('data.currency', 'PHP')->assertJsonPath('data.is_liability', false)
            ->json('data.id');

        $this->getJson('/api/v1/accounts')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.id', $id);

        $this->putJson("/api/v1/accounts/{$id}", [...self::PAYLOAD, 'name' => 'Daily Wallet', 'opening_balance' => '3000.25'])
            ->assertOk()->assertJsonPath('data.name', 'Daily Wallet')->assertJsonPath('data.opening_balance', '3000.25');

        $this->assertDatabaseHas('accounts', ['id' => $id, 'user_id' => $user->id, 'currency' => 'PHP']);
    }

    public function test_credit_card_is_reported_as_a_liability(): void
    {
        $this->actingAs(User::factory()->create());
        $this->postJson('/api/v1/accounts', [...self::PAYLOAD, 'type' => 'credit-card', 'icon' => 'credit-card'])
            ->assertCreated()->assertJsonPath('data.is_liability', true)->assertJsonPath('data.opening_balance', '2500.00');
    }

    public function test_list_supports_status_type_and_search_filters(): void
    {
        $user = User::factory()->create();
        Account::factory()->for($user)->create(['name' => 'Cash Wallet', 'type' => 'cash']);
        Account::factory()->for($user)->create(['name' => 'Savings', 'type' => 'savings']);
        $archived = Account::factory()->for($user)->create(['name' => 'Old Cash', 'type' => 'cash']);
        $archived->delete();
        $this->actingAs($user);

        $this->getJson('/api/v1/accounts?type=cash&search=Wallet')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Cash Wallet');
        $this->getJson('/api/v1/accounts?status=archived')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.is_archived', true);
        $this->getJson('/api/v1/accounts?status=all')->assertJsonCount(3, 'data');
    }

    public function test_user_can_archive_and_restore_an_account(): void
    {
        $user = User::factory()->create();
        $account = Account::factory()->for($user)->create();
        $this->actingAs($user);

        $this->deleteJson("/api/v1/accounts/{$account->id}")->assertNoContent();
        $this->assertSoftDeleted($account);
        $this->putJson("/api/v1/accounts/{$account->id}", self::PAYLOAD)->assertNotFound();
        $this->deleteJson("/api/v1/accounts/{$account->id}")->assertNotFound();

        $this->postJson("/api/v1/accounts/{$account->id}/restore")->assertOk()->assertJsonPath('data.is_archived', false);
        $this->assertNotSoftDeleted($account);
    }

    public function test_user_cannot_mutate_another_users_account(): void
    {
        $account = Account::factory()->for(User::factory()->create())->create();
        $this->actingAs(User::factory()->create());
        $this->putJson("/api/v1/accounts/{$account->id}", self::PAYLOAD)->assertNotFound();
        $this->deleteJson("/api/v1/accounts/{$account->id}")->assertNotFound();
        $account->delete();
        $this->postJson("/api/v1/accounts/{$account->id}/restore")->assertNotFound();
    }

    public function test_account_validation_and_duplicate_rules(): void
    {
        $user = User::factory()->create();
        Account::factory()->for($user)->create(['name' => 'Cash Wallet']);
        $this->actingAs($user);

        $this->postJson('/api/v1/accounts', [
            'name' => 'Cash Wallet', 'type' => 'bank', 'opening_balance' => '-1.555', 'color' => 'orange', 'icon' => 'unknown', 'currency' => 'USD',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'type', 'opening_balance', 'color', 'icon']);

        $this->postJson('/api/v1/accounts', [...self::PAYLOAD, 'name' => 'New Wallet', 'opening_balance' => '0'])->assertCreated()->assertJsonPath('data.currency', 'PHP');
    }

    public function test_restore_rejects_an_active_name_collision(): void
    {
        $user = User::factory()->create();
        $archived = Account::factory()->for($user)->create(['name' => 'Wallet']);
        $archived->delete();
        Account::factory()->for($user)->create(['name' => 'Wallet']);
        $this->actingAs($user);

        $this->postJson("/api/v1/accounts/{$archived->id}/restore")->assertUnprocessable()->assertJsonValidationErrors('name');
    }

    public function test_local_development_seeder_is_idempotent_for_accounts(): void
    {
        $this->seed(LocalDevelopmentSeeder::class);
        $this->seed(LocalDevelopmentSeeder::class);
        $this->assertDatabaseCount('accounts', 5);
        $this->assertDatabaseHas('accounts', ['name' => 'GCash', 'type' => 'e-wallet', 'currency' => 'PHP']);
    }
}
