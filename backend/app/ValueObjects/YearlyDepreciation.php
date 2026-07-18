<?php

namespace App\ValueObjects;

readonly class YearlyDepreciation
{
    public function __construct(
        public int $year,
        public int $annualDepreciation,
        public int $accumulatedDepreciation,
        public int $bookValue,
    ) {}

    public function toArray(): array
    {
        return [
            'year' => $this->year,
            'annualDepreciation' => $this->annualDepreciation,
            'accumulatedDepreciation' => $this->accumulatedDepreciation,
            'bookValue' => $this->bookValue,
        ];
    }
}
