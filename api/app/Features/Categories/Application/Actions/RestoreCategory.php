<?php

declare(strict_types=1);

namespace App\Features\Categories\Application\Actions;

use App\Models\Category;
use App\Models\User;
use Illuminate\Validation\ValidationException;

final class RestoreCategory
{
    public function handle(User $user, int $categoryId): Category
    {
        $category = $user->categories()->onlyTrashed()->findOrFail($categoryId);

        $duplicateExists = $user->categories()
            ->where('type', $category->type->value)
            ->where('name', $category->name)
            ->exists();

        if ($duplicateExists) {
            throw ValidationException::withMessages([
                'name' => ['An active category with this name and type already exists.'],
            ]);
        }

        $category->restore();

        return $category->refresh();
    }
}
