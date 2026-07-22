<?php

declare(strict_types=1);

namespace App\Features\Transactions\Http\Controllers;

use App\Features\Transactions\Application\Actions\CreateTransaction;
use App\Features\Transactions\Application\Actions\DeleteTransaction;
use App\Features\Transactions\Application\Actions\ListTransactions;
use App\Features\Transactions\Application\Actions\RestoreTransaction;
use App\Features\Transactions\Application\Actions\UpdateTransaction;
use App\Features\Transactions\Http\Requests\ListTransactionsRequest;
use App\Features\Transactions\Http\Requests\StoreTransactionRequest;
use App\Features\Transactions\Http\Requests\UpdateTransactionRequest;
use App\Features\Transactions\Http\Resources\TransactionResource;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

final class TransactionController extends Controller
{
    public function index(ListTransactionsRequest $request, ListTransactions $list): AnonymousResourceCollection
    { return TransactionResource::collection($list->handle($this->user($request), $request->filters())); }

    public function store(StoreTransactionRequest $request, CreateTransaction $create): JsonResponse
    { return (new TransactionResource($create->handle($this->user($request), $request->transactionData())))->response()->setStatusCode(201); }

    public function update(UpdateTransactionRequest $request, int $transaction, UpdateTransaction $update): TransactionResource
    { return new TransactionResource($update->handle($this->user($request), $transaction, $request->transactionData())); }

    public function destroy(Request $request, int $transaction, DeleteTransaction $delete): Response
    { $delete->handle($this->user($request), $transaction); return response()->noContent(); }

    public function restore(Request $request, int $transaction, RestoreTransaction $restore): TransactionResource
    { return new TransactionResource($restore->handle($this->user($request), $transaction)); }

    private function user(Request $request): User
    { $user = $request->user(); abort_unless($user instanceof User, 401); return $user; }
}
