<?php

declare(strict_types=1);

namespace App\Features\Categories\Application\Actions;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

final class ListCategories
{
    /**
     * @param  array{status: string, type?: string, search?: string}  $filters
     * @return Collection<int, Category>
     */
    public function handle(User $user, array $filters): Collection
    {
        $query = $user->categories();

        if ($filters['status'] === 'archived') {
            $query->onlyTrashed();
        } elseif ($filters['status'] === 'all') {
            $query->withTrashed();
        }

        if (isset($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (isset($filters['search'])) {
            $query->where('name', 'like', '%'.$filters['search'].'%');
        }

        return $query->orderBy('type')->orderBy('name')->get();
    }
}
