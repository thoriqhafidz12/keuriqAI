import type { Asset, DepreciationSchedule, YearlyDepreciation } from '../types'
import { getCurrentYear } from './helpers'

/**
 * Compute straight-line depreciation schedule for an asset.
 *
 * Formula: Annual Depreciation = (Acquisition Value - Residual Value) / Useful Life
 *
 * Returns a year-by-year breakdown of depreciation, accumulated depreciation,
 * and book value up to the current year or end of useful life.
 */
export function computeDepreciationSchedule(asset: Asset): DepreciationSchedule {
  const { acquisitionValue, residualValue, usefulLife, acquisitionYear } = asset

  // Annual depreciation (rounded to nearest integer)
  const annualDepreciation = Math.round((acquisitionValue - residualValue) / usefulLife)

  const currentYear = getCurrentYear()
  const endYear = acquisitionYear + usefulLife - 1
  const lastRelevantYear = Math.min(currentYear, endYear)

  const years: YearlyDepreciation[] = []

  for (let year = acquisitionYear; year <= lastRelevantYear; year++) {
    const yearsElapsed = year - acquisitionYear + 1
    const accumulated = Math.min(annualDepreciation * yearsElapsed, acquisitionValue - residualValue)
    const bookValue = Math.max(acquisitionValue - accumulated, residualValue)

    years.push({
      year,
      annualDepreciation,
      accumulatedDepreciation: accumulated,
      bookValue,
    })
  }

  const totalAccumulated = years.length > 0 ? years[years.length - 1].accumulatedDepreciation : 0
  const currentBookValue = years.length > 0 ? years[years.length - 1].bookValue : acquisitionValue
  const isFullyDepreciated = currentYear > endYear || currentBookValue <= residualValue

  return {
    assetId: String(asset.id),
    assetName: asset.name,
    acquisitionValue,
    residualValue,
    usefulLife,
    annualDepreciation,
    years,
    totalAccumulatedDepreciation: totalAccumulated,
    currentBookValue,
    isFullyDepreciated,
  }
}

/**
 * Get aggregated depreciation totals across multiple assets.
 */
export function getAggregatedDepreciation(schedules: DepreciationSchedule[]): {
  totalAcquisitionValue: number
  totalAccumulatedDepreciation: number
  totalBookValue: number
} {
  return schedules.reduce(
    (agg, s) => ({
      totalAcquisitionValue: agg.totalAcquisitionValue + s.acquisitionValue,
      totalAccumulatedDepreciation:
        agg.totalAccumulatedDepreciation + s.totalAccumulatedDepreciation,
      totalBookValue: agg.totalBookValue + s.currentBookValue,
    }),
    { totalAcquisitionValue: 0, totalAccumulatedDepreciation: 0, totalBookValue: 0 },
  )
}

/**
 * Find assets that are near end of useful life (within threshold years).
 */
export function getAssetsNearEndOfLife(
  assets: Asset[],
  thresholdYears: number = 1,
): Asset[] {
  const currentYear = getCurrentYear()
  return assets.filter((asset) => {
    const endYear = asset.acquisitionYear + asset.usefulLife - 1
    return currentYear >= endYear - thresholdYears && currentYear <= endYear
  })
}
