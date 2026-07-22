<?php

declare(strict_types=1);

namespace App\Features\Accounts\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Account */
final class AccountResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $ledgerTotal = $this->getAttribute('ledger_total');
        if ($ledgerTotal === null) {
            $ledgerTotal = $this->transactionEntries()
                ->whereHas('transaction', fn ($query) => $query->whereDate('transaction_date', '<=', today()))
                ->sum('balance_delta');
        }
        $currentBalance = bcadd((string) $this->opening_balance, (string) $ledgerTotal, 2);

        return [
            'id' => (int) $this->id,
            'name' => (string) $this->name,
            'type' => $this->type->value,
            'opening_balance' => (string) $this->opening_balance,
            'current_balance' => $currentBalance,
            'currency' => (string) $this->currency,
            'color' => (string) $this->color,
            'icon' => (string) $this->icon,
            'is_liability' => $this->type->isLiability(),
            'is_archived' => $this->trashed(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
