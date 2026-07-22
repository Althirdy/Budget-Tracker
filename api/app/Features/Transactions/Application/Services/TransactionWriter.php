<?php

declare(strict_types=1);

namespace App\Features\Transactions\Application\Services;

use App\Features\Accounts\Domain\AccountType;
use App\Features\Transactions\Domain\EntryRole;
use App\Features\Transactions\Domain\TransactionType;
use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;

final class TransactionWriter
{
    /** @param array<string, mixed> $data */
    public function fill(User $user, Transaction $transaction, array $data): Transaction
    {
        $type = TransactionType::from((string) $data['type']);
        $transaction->fill([
            'type' => $type,
            'category_id' => $type === TransactionType::Transfer ? null : (int) $data['category_id'],
            'amount' => (string) $data['amount'], 'currency' => 'PHP',
            'transaction_date' => (string) $data['transaction_date'],
            'description' => (string) $data['description'], 'notes' => $data['notes'] ?? null,
        ]);
        $transaction->user()->associate($user);
        $transaction->save();
        $transaction->entries()->delete();

        $amount = (string) $data['amount'];
        if ($type === TransactionType::Transfer) {
            $source = $user->accounts()->findOrFail((int) $data['source_account_id']);
            $destination = $user->accounts()->findOrFail((int) $data['destination_account_id']);
            $this->entry($transaction, $source, EntryRole::Source, $this->delta($source, $amount, false));
            $this->entry($transaction, $destination, EntryRole::Destination, $this->delta($destination, $amount, true));
        } else {
            $account = $user->accounts()->findOrFail((int) $data['account_id']);
            $increase = $type === TransactionType::Income;
            $this->entry($transaction, $account, EntryRole::Primary, $this->delta($account, $amount, $increase));
        }

        return $transaction->load(['category', 'entries.account']);
    }

    private function delta(Account $account, string $amount, bool $assetIncrease): string
    {
        $increaseDisplayedBalance = $account->type === AccountType::CreditCard ? ! $assetIncrease : $assetIncrease;
        return $increaseDisplayedBalance ? $amount : '-'.$amount;
    }

    private function entry(Transaction $transaction, Account $account, EntryRole $role, string $delta): void
    {
        $transaction->entries()->create(['account_id' => $account->id, 'role' => $role, 'balance_delta' => $delta]);
    }
}
