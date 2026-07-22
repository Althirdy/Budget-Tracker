<?php

declare(strict_types=1);

namespace App\Models;

use App\Features\Transactions\Domain\TransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Transaction extends Model
{
    use SoftDeletes;

    /** @var list<string> */
    protected $fillable = ['category_id', 'type', 'amount', 'currency', 'transaction_date', 'description', 'notes'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo { return $this->belongsTo(User::class); }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo { return $this->belongsTo(Category::class)->withTrashed(); }

    /** @return HasMany<TransactionEntry, $this> */
    public function entries(): HasMany { return $this->hasMany(TransactionEntry::class); }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['type' => TransactionType::class, 'amount' => 'decimal:2', 'transaction_date' => 'immutable_date', 'deleted_at' => 'datetime'];
    }
}
