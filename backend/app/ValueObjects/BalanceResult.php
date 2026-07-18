<?php

namespace App\ValueObjects;

readonly class BalanceResult
{
    public function __construct(
        public int $initialBalance,
        public int $totalIncome,
        public int $totalExpenses,
        public int $currentBalance,
    ) {}

    public function toArray(): array
    {
        return [
            'initialBalance' => $this->initialBalance,
            'totalIncome' => $this->totalIncome,
            'totalExpenses' => $this->totalExpenses,
            'currentBalance' => $this->currentBalance,
        ];
    }
}
