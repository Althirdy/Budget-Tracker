<?php

declare(strict_types=1);

namespace App\Features\Categories\Application\Actions;

use App\Models\User;

final class ArchiveCategory
{
    public function handle(User $user, int $categoryId): void
    {
        $user->categories()->findOrFail($categoryId)->delete();
    }
}
