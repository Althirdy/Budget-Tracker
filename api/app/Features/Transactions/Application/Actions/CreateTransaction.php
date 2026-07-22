<?php

declare(strict_types=1);

namespace App\Features\Transactions\Application\Actions;

use App\Features\Transactions\Application\Services\TransactionWriter;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\DB;

final class CreateTransaction
{
    public function __construct(private readonly TransactionWriter $writer) {}
    /** @param array<string, mixed> $data */
    public function handle(User $user, array $data): Transaction
    {
        return DB::transaction(fn (): Transaction => $this->writer->fill($user, new Transaction(), $data));
    }
}
