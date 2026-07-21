<?php

declare(strict_types=1);

namespace App\Features\Accounts\Domain;

enum AccountType: string
{
    case Cash = 'cash';
    case Checking = 'checking';
    case Savings = 'savings';
    case EWallet = 'e-wallet';
    case CreditCard = 'credit-card';
    case Investment = 'investment';

    public function isLiability(): bool
    {
        return $this === self::CreditCard;
    }
}
