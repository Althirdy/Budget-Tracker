<?php

declare(strict_types=1);

namespace App\Features\Transactions\Http\Resources;

use App\Features\Transactions\Domain\EntryRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Transaction */
final class TransactionResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $primary = $this->entries->firstWhere('role', EntryRole::Primary);
        $source = $this->entries->firstWhere('role', EntryRole::Source);
        $destination = $this->entries->firstWhere('role', EntryRole::Destination);
        $account = fn ($entry): ?array => $entry ? [
            'id' => (int) $entry->account->id, 'name' => (string) $entry->account->name,
            'type' => $entry->account->type->value, 'color' => (string) $entry->account->color,
            'icon' => (string) $entry->account->icon, 'is_archived' => $entry->account->trashed(),
        ] : null;

        return [
            'id' => (int) $this->id, 'type' => $this->type->value, 'amount' => (string) $this->amount,
            'currency' => (string) $this->currency, 'transaction_date' => $this->transaction_date->format('Y-m-d'),
            'description' => (string) $this->description, 'notes' => $this->notes,
            'category' => $this->category ? [
                'id' => (int) $this->category->id, 'name' => (string) $this->category->name,
                'type' => $this->category->type->value, 'color' => (string) $this->category->color,
                'icon' => (string) $this->category->icon, 'is_archived' => $this->category->trashed(),
            ] : null,
            'account' => $account($primary), 'source_account' => $account($source), 'destination_account' => $account($destination),
            'is_deleted' => $this->trashed(), 'created_at' => $this->created_at?->toISOString(), 'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
