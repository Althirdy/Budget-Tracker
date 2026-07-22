<?php

declare(strict_types=1);

namespace App\Features\Transactions\Http\Requests;

use App\Features\Transactions\Domain\TransactionType;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

abstract class TransactionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation(): void
    {
        $notes = trim((string) $this->input('notes'));
        $this->merge(['description' => trim((string) $this->input('description')), 'notes' => $notes === '' ? null : $notes]);
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $userId = $this->user() instanceof User ? $this->user()->id : 0;
        $type = (string) $this->input('type');
        $activeAccount = Rule::exists('accounts', 'id')->where(fn (Builder $query): Builder => $query->where('user_id', $userId)->whereNull('deleted_at'));

        return [
            'type' => ['required', Rule::enum(TransactionType::class)],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'gt:0', 'max:999999999999.99'],
            'transaction_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'description' => ['required', 'string', 'min:2', 'max:100'],
            'notes' => ['nullable', 'string', 'max:500'],
            'account_id' => ['required_unless:type,transfer', 'prohibited_if:type,transfer', $activeAccount],
            'category_id' => [
                'required_unless:type,transfer', 'prohibited_if:type,transfer',
                Rule::exists('categories', 'id')->where(fn (Builder $query): Builder => $query
                    ->where('user_id', $userId)->where('type', $type)->whereNull('deleted_at')),
            ],
            'source_account_id' => ['required_if:type,transfer', 'prohibited_unless:type,transfer', $activeAccount],
            'destination_account_id' => ['required_if:type,transfer', 'prohibited_unless:type,transfer', 'different:source_account_id', $activeAccount],
        ];
    }

    /** @return array<string, mixed> */
    public function transactionData(): array { return $this->validated(); }
}
