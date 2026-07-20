<?php

declare(strict_types=1);

namespace App\Features\Categories\Application\Actions;

use App\Models\Category;
use App\Models\User;

final class CreateCategory
{
    /** @param array{name: string, type: string, color: string, icon: string} $data */
    public function handle(User $user, array $data): Category
    {
        return $user->categories()->create($data);
    }
}
