<?php

declare(strict_types=1);

namespace App\Features\Categories\Application\Actions;

use App\Models\Category;
use App\Models\User;

final class UpdateCategory
{
    /** @param array{name: string, type: string, color: string, icon: string} $data */
    public function handle(User $user, int $categoryId, array $data): Category
    {
        $category = $user->categories()->findOrFail($categoryId);
        $category->update($data);

        return $category->refresh();
    }
}
