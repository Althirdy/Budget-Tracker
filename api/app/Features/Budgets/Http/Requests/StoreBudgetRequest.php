<?php

declare(strict_types=1);

namespace App\Features\Budgets\Http\Requests;

use App\Features\Categories\Domain\CategoryType;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $user = $this->user();
        $userId = $user instanceof User ? $user->id : 0;
        $periodDate = (string) $this->input('period').'-01';

        return [
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where(
                    fn (Builder $query): Builder => $query
                        ->where('user_id', $userId)
                        ->where('type', CategoryType::Expense->value)
                        ->whereNull('deleted_at')
                ),
                Rule::unique('budgets', 'category_id')->where(
                    fn (Builder $query): Builder => $query
                        ->where('user_id', $userId)
                        ->whereDate('period', $periodDate)
                ),
            ],
            'period' => ['required', 'date_format:Y-m'],
            'amount' => ['required', 'decimal:0,2', 'gt:0', 'max:999999999999.99'],
        ];
    }

    /** @return array{category_id: int, period: string, amount: string} */
    public function budgetData(): array
    {
        $validated = $this->validated();

        return [
            'category_id' => (int) $validated['category_id'],
            'period' => (string) $validated['period'],
            'amount' => (string) $validated['amount'],
        ];
    }
}
