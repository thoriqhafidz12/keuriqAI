<?php

namespace App\ValueObjects;

readonly class FundAllocation
{
    public function __construct(
        public int $expenseId,
        public string $expenseDate,
        public string $expenseCategory,
        public int $amount,
    ) {}

    public function toArray(): array
    {
        return [
            'expenseId' => $this->expenseId,
            'expenseDate' => $this->expenseDate,
            'expenseCategory' => $this->expenseCategory,
            'amount' => $this->amount,
        ];
    }
}
