<?php

declare(strict_types=1);

namespace App\Features\Categories\Domain;

enum CategoryType: string
{
    case Income = 'income';
    case Expense = 'expense';
}
