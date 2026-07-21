<?php

declare(strict_types=1);

namespace App\Features\Accounts\Http\Requests;

use App\Features\Accounts\Domain\AccountIcon;
use App\Features\Accounts\Domain\AccountType;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateAccountRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => trim((string) $this->input('name')),
            'color' => strtoupper(trim((string) $this->input('color'))),
        ]);
    }

    /** @return array<string, list<mixed>> */
    public function rules(): array
    {
        $user = $this->user();
        $accountId = (int) $this->route('account');

        return [
            'name' => ['required', 'string', 'min:2', 'max:50', Rule::unique('accounts', 'name')->ignore($accountId)->where(
                fn (Builder $query): Builder => $query
                    ->where('user_id', $user instanceof User ? $user->id : 0)
                    ->whereNull('deleted_at')
            )],
            'type' => ['required', Rule::enum(AccountType::class)],
            'opening_balance' => ['required', 'numeric', 'decimal:0,2', 'gte:0', 'max:999999999999.99'],
            'color' => ['required', 'regex:/^#[0-9A-F]{6}$/'],
            'icon' => ['required', Rule::enum(AccountIcon::class)],
        ];
    }

    /** @return array{name: string, type: string, opening_balance: string, color: string, icon: string} */
    public function accountData(): array
    {
        /** @var array{name: string, type: string, opening_balance: string, color: string, icon: string} */
        return $this->validated();
    }
}
