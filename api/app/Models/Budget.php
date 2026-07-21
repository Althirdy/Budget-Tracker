<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\BudgetFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class Budget extends Model
{
    /** @use HasFactory<BudgetFactory> */
    use HasFactory;

    /** @var list<string> */
    protected $fillable = ['category_id', 'period', 'amount', 'currency'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class)->withTrashed();
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'period' => 'immutable_date',
            'amount' => 'decimal:2',
        ];
    }
}
