<?php

declare(strict_types=1);

namespace App\Features\Transactions\Domain;

enum EntryRole: string
{
    case Primary = 'primary';
    case Source = 'source';
    case Destination = 'destination';
}
