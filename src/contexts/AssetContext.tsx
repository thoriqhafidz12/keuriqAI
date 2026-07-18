import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react'
import type { Asset, DepreciationSchedule } from '../types'
import { useAuth } from '../hooks/useAuth'
import { assetApi } from '../api/assetApi'
import { computeDepreciationSchedule, getAggregatedDepreciation, getAssetsNearEndOfLife } from '../utils/depreciation'

interface AssetContextValue {
  assets: Asset[]
  isLoading: boolean
  error: string | null
  addAsset: (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Asset>
  updateAsset: (id: string | number, updates: Partial<Asset>) => Promise<void>
  deleteAsset: (id: string | number) => Promise<void>
  getAsset: (id: string | number) => Asset | undefined
  getDepreciationSchedule: (id: string | number) => DepreciationSchedule | undefined
  getAggregatedData: () => { totalAcquisitionValue: number; totalAccumulatedDepreciation: number; totalBookValue: number }
  getAssetsNearEnd: (yearsThreshold?: number) => Asset[]
}

export const AssetContext = createContext<AssetContextValue | null>(null)

export function AssetProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch assets when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const fetchAssets = async () => {
      try {
        const data = await assetApi.getAll()
        setAssets(data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Gagal memuat aset.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssets()
  }, [isAuthenticated])

  const addAsset = useCallback(
    async (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'registerNumber'>): Promise<Asset> => {
      const newAsset = await assetApi.create({
        name: data.name,
        category: data.category,
        location: data.location,
        acquisition_value: data.acquisitionValue,
        acquisition_date: data.acquisitionDate,
        acquisition_year: data.acquisitionYear,
        useful_life: data.usefulLife,
        residual_value: data.residualValue,
        description: data.description,
      })
      setAssets((prev) => [...prev, newAsset])
      return newAsset
    },
    [],
  )

  const updateAsset = useCallback(
    async (id: string | number, updates: Partial<Asset>): Promise<void> => {
      const apiUpdates: Record<string, any> = {}
      if (updates.name !== undefined) apiUpdates.name = updates.name
      if (updates.category !== undefined) apiUpdates.category = updates.category
      if (updates.location !== undefined) apiUpdates.location = updates.location
      if (updates.acquisitionValue !== undefined) apiUpdates.acquisition_value = updates.acquisitionValue
      if (updates.acquisitionDate !== undefined) apiUpdates.acquisition_date = updates.acquisitionDate
      if (updates.acquisitionYear !== undefined) apiUpdates.acquisition_year = updates.acquisitionYear
      if (updates.usefulLife !== undefined) apiUpdates.useful_life = updates.usefulLife
      if (updates.residualValue !== undefined) apiUpdates.residual_value = updates.residualValue
      if (updates.description !== undefined) apiUpdates.description = updates.description

      const updated = await assetApi.update(id, apiUpdates)
      setAssets((prev) => prev.map((a) => (a.id === id ? updated : a)))
    },
    [],
  )

  const deleteAsset = useCallback(
    async (id: string | number): Promise<void> => {
      await assetApi.delete(id)
      setAssets((prev) => prev.filter((a) => a.id !== id))
    },
    [],
  )

  const getAsset = useCallback(
    (id: string | number) => assets.find((a) => a.id === id),
    [assets],
  )

  const getDepreciationSchedule = useCallback(
    (id: string | number) => {
      const asset = assets.find((a) => a.id === id)
      if (!asset) return undefined
      return computeDepreciationSchedule(asset)
    },
    [assets],
  )

  const getAggregatedData = useCallback(() => {
    const schedules = assets.map((a) => computeDepreciationSchedule(a))
    return getAggregatedDepreciation(schedules)
  }, [assets])

  const getAssetsNearEnd = useCallback(
    (yearsThreshold: number = 1) => getAssetsNearEndOfLife(assets, yearsThreshold),
    [assets],
  )

  const value = useMemo(
    () => ({
      assets,
      isLoading,
      error,
      addAsset,
      updateAsset,
      deleteAsset,
      getAsset,
      getDepreciationSchedule,
      getAggregatedData,
      getAssetsNearEnd,
    }),
    [assets, isLoading, error, addAsset, updateAsset, deleteAsset, getAsset, getDepreciationSchedule, getAggregatedData, getAssetsNearEnd],
  )

  return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>
}
