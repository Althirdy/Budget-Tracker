<?php

declare(strict_types=1);

namespace App\Features\Budgets\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Budget */
final class BudgetResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => (int) $this->id,
            'period' => $this->period->format('Y-m'),
            'amount' => (string) $this->amount,
            'currency' => (string) $this->currency,
            'category' => [
                'id' => (int) $this->category->id,
                'name' => (string) $this->category->name,
                'color' => (string) $this->category->color,
                'icon' => (string) $this->category->icon,
                'is_archived' => $this->category->trashed(),
            ],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
