<?php

declare(strict_types=1);

namespace App\Features\Transactions\Domain;

enum TransactionType: string
{
    case Income = 'income';
    case Expense = 'expense';
    case Transfer = 'transfer';
}
