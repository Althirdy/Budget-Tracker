<?php

declare(strict_types=1);

namespace App\Models;

use App\Features\Accounts\Domain\AccountType;
use Database\Factories\AccountFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

final class Account extends Model
{
    /** @use HasFactory<AccountFactory> */
    use HasFactory, SoftDeletes;

    /** @var list<string> */
    protected $fillable = ['name', 'type', 'opening_balance', 'currency', 'color', 'icon'];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<TransactionEntry, $this> */
    public function transactionEntries(): HasMany
    {
        return $this->hasMany(TransactionEntry::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'type' => AccountType::class,
            'opening_balance' => 'decimal:2',
            'deleted_at' => 'datetime',
        ];
    }
}
