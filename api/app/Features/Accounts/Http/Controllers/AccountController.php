<?php

declare(strict_types=1);

namespace App\Features\Accounts\Http\Controllers;

use App\Features\Accounts\Application\Actions\ArchiveAccount;
use App\Features\Accounts\Application\Actions\CreateAccount;
use App\Features\Accounts\Application\Actions\ListAccounts;
use App\Features\Accounts\Application\Actions\RestoreAccount;
use App\Features\Accounts\Application\Actions\UpdateAccount;
use App\Features\Accounts\Http\Requests\ListAccountsRequest;
use App\Features\Accounts\Http\Requests\StoreAccountRequest;
use App\Features\Accounts\Http\Requests\UpdateAccountRequest;
use App\Features\Accounts\Http\Resources\AccountResource;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

final class AccountController extends Controller
{
    public function index(ListAccountsRequest $request, ListAccounts $list): AnonymousResourceCollection
    {
        return AccountResource::collection($list->handle($this->user($request), $request->filters()));
    }

    public function store(StoreAccountRequest $request, CreateAccount $create): JsonResponse
    {
        $account = $create->handle($this->user($request), $request->accountData());

        return (new AccountResource($account))->response()->setStatusCode(201);
    }

    public function update(UpdateAccountRequest $request, int $account, UpdateAccount $update): AccountResource
    {
        return new AccountResource($update->handle($this->user($request), $account, $request->accountData()));
    }

    public function destroy(Request $request, int $account, ArchiveAccount $archive): Response
    {
        $archive->handle($this->user($request), $account);

        return response()->noContent();
    }

    public function restore(Request $request, int $account, RestoreAccount $restore): AccountResource
    {
        return new AccountResource($restore->handle($this->user($request), $account));
    }

    private function user(Request $request): User
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        return $user;
    }
}
