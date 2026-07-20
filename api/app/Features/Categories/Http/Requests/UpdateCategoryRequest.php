<?php

declare(strict_types=1);

namespace App\Features\Categories\Http\Requests;

use App\Features\Categories\Domain\CategoryIcon;
use App\Features\Categories\Domain\CategoryType;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

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
        $categoryId = (int) $this->route('category');

        return [
            'name' => [
                'required',
                'string',
                'min:2',
                'max:50',
                Rule::unique('categories', 'name')
                    ->ignore($categoryId)
                    ->where(
                        fn (Builder $query): Builder => $query
                            ->where('user_id', $user instanceof User ? $user->id : 0)
                            ->where('type', (string) $this->input('type'))
                            ->whereNull('deleted_at')
                    ),
            ],
            'type' => ['required', Rule::enum(CategoryType::class)],
            'color' => ['required', 'regex:/^#[0-9A-F]{6}$/'],
            'icon' => ['required', Rule::enum(CategoryIcon::class)],
        ];
    }

    /** @return array{name: string, type: string, color: string, icon: string} */
    public function categoryData(): array
    {
        /** @var array{name: string, type: string, color: string, icon: string} */
        return $this->validated();
    }
}
