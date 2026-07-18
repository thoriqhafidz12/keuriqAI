<?php

namespace App\Services;

use App\Models\Asset;
use App\ValueObjects\DepreciationSchedule;
use App\ValueObjects\YearlyDepreciation;
use Illuminate\Support\Collection;

class DepreciationService
{
    /**
     * Compute straight-line depreciation schedule for an asset.
     *
     * Formula: Annual Depreciation = (Acquisition Value - Residual Value) / Useful Life
     *
     * Returns a year-by-year breakdown of depreciation, accumulated depreciation,
     * and book value up to the current year or end of useful life.
     *
     * Ported from src/utils/depreciation.ts:computeDepreciationSchedule()
     */
    public function computeSchedule(Asset $asset): DepreciationSchedule
    {
        $acquisitionValue = (int) $asset->acquisition_value;
        $residualValue = (int) $asset->residual_value;
        $usefulLife = (int) $asset->useful_life;
        $acquisitionYear = (int) $asset->acquisition_year;

        // Annual depreciation (rounded to nearest integer)
        $annualDepreciation = (int) round(($acquisitionValue - $residualValue) / $usefulLife);

        $currentYear = (int) date('Y');
        $endYear = $acquisitionYear + $usefulLife - 1;
        $lastRelevantYear = min($currentYear, $endYear);

        $years = [];

        for ($year = $acquisitionYear; $year <= $lastRelevantYear; $year++) {
            $yearsElapsed = $year - $acquisitionYear + 1;
            $accumulated = min($annualDepreciation * $yearsElapsed, $acquisitionValue - $residualValue);
            $bookValue = max($acquisitionValue - $accumulated, $residualValue);

            $years[] = new YearlyDepreciation(
                year: $year,
                annualDepreciation: $annualDepreciation,
                accumulatedDepreciation: $accumulated,
                bookValue: $bookValue,
            );
        }

        $totalAccumulated = count($years) > 0 ? $years[count($years) - 1]->accumulatedDepreciation : 0;
        $currentBookValue = count($years) > 0 ? $years[count($years) - 1]->bookValue : $acquisitionValue;
        $isFullyDepreciated = $currentYear > $endYear || $currentBookValue <= $residualValue;

        return new DepreciationSchedule(
            assetId: $asset->id,
            assetName: $asset->name,
            acquisitionValue: $acquisitionValue,
            residualValue: $residualValue,
            usefulLife: $usefulLife,
            annualDepreciation: $annualDepreciation,
            years: $years,
            totalAccumulatedDepreciation: $totalAccumulated,
            currentBookValue: $currentBookValue,
            isFullyDepreciated: $isFullyDepreciated,
        );
    }

    /**
     * Get aggregated depreciation totals across multiple assets.
     * Ported from src/utils/depreciation.ts:getAggregatedDepreciation()
     */
    public function getAggregated(Collection $schedules): array
    {
        $totalAcquisitionValue = 0;
        $totalAccumulatedDepreciation = 0;
        $totalBookValue = 0;

        foreach ($schedules as $s) {
            $totalAcquisitionValue += $s->acquisitionValue;
            $totalAccumulatedDepreciation += $s->totalAccumulatedDepreciation;
            $totalBookValue += $s->currentBookValue;
        }

        return [
            'totalAcquisitionValue' => $totalAcquisitionValue,
            'totalAccumulatedDepreciation' => $totalAccumulatedDepreciation,
            'totalBookValue' => $totalBookValue,
        ];
    }

    /**
     * Find assets that are near end of useful life (within threshold years).
     * Ported from src/utils/depreciation.ts:getAssetsNearEndOfLife()
     */
    public function getAssetsNearEndOfLife(Collection $assets, int $thresholdYears = 1): Collection
    {
        $currentYear = (int) date('Y');
        return $assets->filter(function (Asset $asset) use ($currentYear, $thresholdYears) {
            $endYear = (int) $asset->acquisition_year + (int) $asset->useful_life - 1;
            return $currentYear >= $endYear - $thresholdYears && $currentYear <= $endYear;
        });
    }
}
