<?php

declare(strict_types=1);

namespace App\Features\Budgets\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class ListBudgetsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<string>> */
    public function rules(): array
    {
        return ['period' => ['sometimes', 'date_format:Y-m']];
    }

    public function period(): string
    {
        return (string) ($this->validated('period') ?? now()->format('Y-m'));
    }
}
