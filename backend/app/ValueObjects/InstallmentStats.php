<?php

namespace App\ValueObjects;

readonly class InstallmentStats
{
    public function __construct(
        public int $totalPaid,
        public int $remaining,
        public float $paidPercentage,
        public int $remainingMonths,
        public bool $isPaidOff,
    ) {}

    public function toArray(): array
    {
        return [
            'totalPaid' => $this->totalPaid,
            'remaining' => $this->remaining,
            'paidPercentage' => $this->paidPercentage,
            'remainingMonths' => $this->remainingMonths,
            'isPaidOff' => $this->isPaidOff,
        ];
    }
}
