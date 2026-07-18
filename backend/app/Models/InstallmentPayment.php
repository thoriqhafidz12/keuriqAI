<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstallmentPayment extends Model
{
    protected $fillable = [
        'user_id',
        'installment_id',
        'period_number',
        'date',
        'amount',
        'description',
        'expense_transaction_id',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'amount' => 'int',
            'period_number' => 'int',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function installment(): BelongsTo
    {
        return $this->belongsTo(Installment::class);
    }

    public function expenseTransaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class, 'expense_transaction_id');
    }
}
