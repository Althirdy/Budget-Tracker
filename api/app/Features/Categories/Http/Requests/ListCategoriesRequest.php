<?php

declare(strict_types=1);

namespace App\Features\Categories\Http\Requests;

use App\Features\Categories\Domain\CategoryType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ListCategoriesRequest extends FormRequest
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
            'type' => ['sometimes', Rule::enum(CategoryType::class)],
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

        $search = trim((string) ($validated['search'] ?? ''));
        if ($search !== '') {
            $filters['search'] = $search;
        }

        return $filters;
    }
}
