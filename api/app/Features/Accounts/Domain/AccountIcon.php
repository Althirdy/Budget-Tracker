<?php

declare(strict_types=1);

namespace App\Features\Accounts\Domain;

enum AccountIcon: string
{
    case Wallet = 'wallet';
    case Landmark = 'landmark';
    case PiggyBank = 'piggy-bank';
    case Smartphone = 'smartphone';
    case CreditCard = 'credit-card';
    case ChartNoAxesCombined = 'chart-no-axes-combined';
}
