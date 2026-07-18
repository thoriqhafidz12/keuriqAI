<?php

namespace App\ValueObjects;

readonly class FundSource
{
    /**
     * @param FundAllocation[] $allocations
     */
    public function __construct(
        public int $transactionId,
        public string $type,
        public string $date,
        public string $category,
        public ?string $source,
        public string $description,
        public int $originalAmount,
        public int $usedAmount,
        public int $remainingAmount,
        public array $allocations,
    ) {}

    public function toArray(): array
    {
        return [
            'transactionId' => $this->transactionId,
            'type' => $this->type,
            'date' => $this->date,
            'category' => $this->category,
            'source' => $this->source,
            'description' => $this->description,
            'originalAmount' => $this->originalAmount,
            'usedAmount' => $this->usedAmount,
            'remainingAmount' => $this->remainingAmount,
            'allocations' => array_map(fn(FundAllocation $a) => $a->toArray(), $this->allocations),
        ];
    }
}
