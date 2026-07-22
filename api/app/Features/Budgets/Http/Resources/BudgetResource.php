<?php

declare(strict_types=1);

namespace App\Features\Budgets\Http\Resources;

use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Budget */
final class BudgetResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $spentTotal = $this->getAttribute('spent_total');
        if ($spentTotal === null) {
            $spentTotal = Transaction::query()
                ->where('user_id', $this->user_id)->where('category_id', $this->category_id)->where('type', 'expense')
                ->whereBetween('transaction_date', [$this->period->startOfMonth()->toDateString(), $this->period->endOfMonth()->toDateString()])
                ->sum('amount');
        }
        $spent = (string) $spentTotal;
        $remaining = bcsub((string) $this->amount, $spent, 2);
        $progress = bcmul(bcdiv($spent, (string) $this->amount, 6), '100', 2);

        return [
            'id' => (int) $this->id,
            'period' => $this->period->format('Y-m'),
            'amount' => (string) $this->amount,
            'spent' => $spent,
            'remaining' => $remaining,
            'progress_percentage' => $progress,
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
