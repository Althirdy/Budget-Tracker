<?php

declare(strict_types=1);

namespace App\Features\Budgets\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class UpdateBudgetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return ['amount' => ['required', 'decimal:0,2', 'gt:0', 'max:999999999999.99']];
    }

    public function amount(): string
    {
        return (string) $this->validated('amount');
    }
}
