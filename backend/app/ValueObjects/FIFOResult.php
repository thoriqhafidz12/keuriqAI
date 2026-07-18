<?php

namespace App\ValueObjects;

readonly class FIFOResult
{
    /**
     * @param FundSource[] $sources
     */
    public function __construct(
        public array $sources,
        public int $totalBalance,
        public int $totalAvailable,
        public int $totalUsed,
    ) {}

    public function toArray(): array
    {
        return [
            'sources' => array_map(fn(FundSource $s) => $s->toArray(), $this->sources),
            'totalBalance' => $this->totalBalance,
            'totalAvailable' => $this->totalAvailable,
            'totalUsed' => $this->totalUsed,
        ];
    }
}
