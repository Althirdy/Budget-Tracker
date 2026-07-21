<?php

declare(strict_types=1);

namespace App\Features\Budgets\Http\Controllers;

use App\Features\Budgets\Application\Actions\CreateBudget;
use App\Features\Budgets\Application\Actions\DeleteBudget;
use App\Features\Budgets\Application\Actions\ListBudgets;
use App\Features\Budgets\Application\Actions\UpdateBudget;
use App\Features\Budgets\Http\Requests\ListBudgetsRequest;
use App\Features\Budgets\Http\Requests\StoreBudgetRequest;
use App\Features\Budgets\Http\Requests\UpdateBudgetRequest;
use App\Features\Budgets\Http\Resources\BudgetResource;
use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

final class BudgetController extends Controller
{
    public function index(ListBudgetsRequest $request, ListBudgets $list): JsonResponse
    {
        $period = $request->period();
        $budgets = $list->handle($this->user($request), $period);
        $plannedTotal = $budgets->reduce(
            fn (string $total, Budget $budget): string => bcadd($total, (string) $budget->amount, 2),
            '0.00',
        );

        return response()->json([
            'data' => BudgetResource::collection($budgets)->resolve($request),
            'meta' => [
                'planned_total' => $plannedTotal,
                'currency' => 'PHP',
                'period' => $period,
            ],
        ]);
    }

    public function store(StoreBudgetRequest $request, CreateBudget $create): JsonResponse
    {
        $budget = $create->handle($this->user($request), $request->budgetData());

        return (new BudgetResource($budget))->response()->setStatusCode(201);
    }

    public function update(
        UpdateBudgetRequest $request,
        int $budget,
        UpdateBudget $update,
    ): BudgetResource {
        return new BudgetResource($update->handle($this->user($request), $budget, $request->amount()));
    }

    public function destroy(Request $request, int $budget, DeleteBudget $delete): Response
    {
        $delete->handle($this->user($request), $budget);

        return response()->noContent();
    }

    private function user(Request $request): User
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        return $user;
    }
}
