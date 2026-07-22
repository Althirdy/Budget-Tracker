<?php

declare(strict_types=1);

namespace App\Features\Transactions\Http\Requests;

use App\Features\Transactions\Domain\TransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class ListTransactionsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        return [
            'status' => ['sometimes', Rule::in(['active', 'deleted'])],
            'type' => ['sometimes', Rule::enum(TransactionType::class)],
            'account_id' => ['sometimes', 'integer', 'min:1'],
            'category_id' => ['sometimes', 'integer', 'min:1'],
            'date_from' => ['sometimes', 'date_format:Y-m-d'],
            'date_to' => ['sometimes', 'date_format:Y-m-d', 'after_or_equal:date_from'],
            'search' => ['sometimes', 'string', 'max:100'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    /** @return array<string, mixed> */
    public function filters(): array
    {
        return ['status' => $this->validated('status', 'active'), ...$this->safe()->except(['status', 'page'])];
    }
}
