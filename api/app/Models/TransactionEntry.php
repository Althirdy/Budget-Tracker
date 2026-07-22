<?php

declare(strict_types=1);

namespace App\Models;

use App\Features\Transactions\Domain\EntryRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class TransactionEntry extends Model
{
    /** @var list<string> */
    protected $fillable = ['account_id', 'role', 'balance_delta'];

    /** @return BelongsTo<Transaction, $this> */
    public function transaction(): BelongsTo { return $this->belongsTo(Transaction::class); }

    /** @return BelongsTo<Account, $this> */
    public function account(): BelongsTo { return $this->belongsTo(Account::class)->withTrashed(); }

    /** @return array<string, string> */
    protected function casts(): array { return ['role' => EntryRole::class, 'balance_delta' => 'decimal:2']; }
}
