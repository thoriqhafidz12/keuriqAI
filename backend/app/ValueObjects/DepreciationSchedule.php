<?php

namespace App\ValueObjects;

readonly class DepreciationSchedule
{
    /**
     * @param YearlyDepreciation[] $years
     */
    public function __construct(
        public int $assetId,
        public string $assetName,
        public int $acquisitionValue,
        public int $residualValue,
        public int $usefulLife,
        public int $annualDepreciation,
        public array $years,
        public int $totalAccumulatedDepreciation,
        public int $currentBookValue,
        public bool $isFullyDepreciated,
    ) {}

    public function toArray(): array
    {
        return [
            'assetId' => $this->assetId,
            'assetName' => $this->assetName,
            'acquisitionValue' => $this->acquisitionValue,
            'residualValue' => $this->residualValue,
            'usefulLife' => $this->usefulLife,
            'annualDepreciation' => $this->annualDepreciation,
            'years' => array_map(fn(YearlyDepreciation $y) => $y->toArray(), $this->years),
            'totalAccumulatedDepreciation' => $this->totalAccumulatedDepreciation,
            'currentBookValue' => $this->currentBookValue,
            'isFullyDepreciated' => $this->isFullyDepreciated,
        ];
    }
}
