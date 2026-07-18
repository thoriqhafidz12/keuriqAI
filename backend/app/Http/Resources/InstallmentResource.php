<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstallmentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'totalPrice' => (int) $this->total_price,
            'downPayment' => (int) $this->down_payment,
            'tenor' => (int) $this->tenor,
            'startDate' => $this->start_date instanceof \DateTimeInterface ? $this->start_date->format('Y-m-d') : $this->start_date,
            'monthlyAmount' => (int) $this->monthly_amount,
            'status' => $this->status,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
