<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstallmentPaymentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'installmentId' => (int) $this->installment_id,
            'periodNumber' => $this->period_number,
            'date' => $this->date instanceof \DateTimeInterface ? $this->date->format('Y-m-d') : $this->date,
            'amount' => (int) $this->amount,
            'description' => $this->description,
            'expenseTransactionId' => (int) $this->expense_transaction_id,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
