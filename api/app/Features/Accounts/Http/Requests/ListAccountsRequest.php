<?php

declare(strict_types=1);

namespace App\Features\Accounts\Http\Requests;

use App\Features\Accounts\Domain\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ListAccountsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(['active', 'archived', 'all'])],
            'type' => ['sometimes', Rule::enum(AccountType::class)],
            'search' => ['sometimes', 'string', 'max:50'],
        ];
    }

    /** @return array{status: string, type?: string, search?: string} */
    public function filters(): array
    {
        $validated = $this->validated();
        $filters = ['status' => (string) ($validated['status'] ?? 'active')];

        if (isset($validated['type'])) {
            $filters['type'] = (string) $validated['type'];
        }

        if (isset($validated['search']) && trim((string) $validated['search']) !== '') {
            $filters['search'] = trim((string) $validated['search']);
        }

        return $filters;
    }
}
