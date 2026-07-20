<?php

declare(strict_types=1);

namespace App\Features\Categories\Domain;

enum CategoryIcon: string
{
    case ShoppingCart = 'shopping-cart';
    case Utensils = 'utensils';
    case House = 'house';
    case Car = 'car';
    case HeartPulse = 'heart-pulse';
    case GraduationCap = 'graduation-cap';
    case Plane = 'plane';
    case Receipt = 'receipt';
    case BriefcaseBusiness = 'briefcase-business';
    case Banknote = 'banknote';
    case Gift = 'gift';
    case CircleEllipsis = 'circle-ellipsis';
}
