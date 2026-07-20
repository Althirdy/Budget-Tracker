<?php

declare(strict_types=1);

namespace App\Features\Categories\Http\Controllers;

use App\Features\Categories\Application\Actions\ArchiveCategory;
use App\Features\Categories\Application\Actions\CreateCategory;
use App\Features\Categories\Application\Actions\ListCategories;
use App\Features\Categories\Application\Actions\RestoreCategory;
use App\Features\Categories\Application\Actions\UpdateCategory;
use App\Features\Categories\Http\Requests\ListCategoriesRequest;
use App\Features\Categories\Http\Requests\StoreCategoryRequest;
use App\Features\Categories\Http\Requests\UpdateCategoryRequest;
use App\Features\Categories\Http\Resources\CategoryResource;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

final class CategoryController extends Controller
{
    public function index(ListCategoriesRequest $request, ListCategories $list): AnonymousResourceCollection
    {
        return CategoryResource::collection($list->handle($this->user($request), $request->filters()));
    }

    public function store(StoreCategoryRequest $request, CreateCategory $create): JsonResponse
    {
        $category = $create->handle($this->user($request), $request->categoryData());

        return (new CategoryResource($category))->response()->setStatusCode(201);
    }

    public function update(
        UpdateCategoryRequest $request,
        int $category,
        UpdateCategory $update,
    ): CategoryResource {
        return new CategoryResource(
            $update->handle($this->user($request), $category, $request->categoryData())
        );
    }

    public function destroy(Request $request, int $category, ArchiveCategory $archive): Response
    {
        $archive->handle($this->user($request), $category);

        return response()->noContent();
    }

    public function restore(Request $request, int $category, RestoreCategory $restore): CategoryResource
    {
        return new CategoryResource($restore->handle($this->user($request), $category));
    }

    private function user(Request $request): User
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        return $user;
    }
}
