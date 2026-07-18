import apiClient from './client'
import type {
  ApiResponse,
  Asset,
  AssetChange,
  DepreciationSchedule,
  StoreAssetRequest,
  UpdateAssetRequest,
} from './types'

export const assetApi = {
  /** Get all assets */
  getAll: async (): Promise<Asset[]> => {
    const res = await apiClient.get<ApiResponse<Asset[]>>('/assets')
    return res.data.data
  },

  /** Get a single asset */
  getById: async (id: number | string): Promise<Asset> => {
    const res = await apiClient.get<ApiResponse<Asset>>(`/assets/${id}`)
    return res.data.data
  },

  /** Create a new asset */
  create: async (data: StoreAssetRequest): Promise<Asset> => {
    const res = await apiClient.post<ApiResponse<Asset>>('/assets', data)
    return res.data.data
  },

  /** Update an asset */
  update: async (id: number | string, data: UpdateAssetRequest): Promise<Asset> => {
    const res = await apiClient.put<ApiResponse<Asset>>(`/assets/${id}`, data)
    return res.data.data
  },

  /** Delete an asset */
  delete: async (id: number | string): Promise<void> => {
    await apiClient.delete(`/assets/${id}`)
  },

  /** Get change history for an asset */
  getHistory: async (assetId: number | string): Promise<AssetChange[]> => {
    const res = await apiClient.get<ApiResponse<AssetChange[]>>(`/assets/${assetId}/history`)
    return res.data.data
  },
}

export const depreciationApi = {
  /** Get aggregated depreciation for all assets */
  getAggregated: async (): Promise<{
    totalAcquisitionValue: number
    totalAccumulatedDepreciation: number
    totalBookValue: number
  }> => {
    const res = await apiClient.get<ApiResponse<{
      totalAcquisitionValue: number
      totalAccumulatedDepreciation: number
      totalBookValue: number
    }>>('/reports/depreciation')
    return res.data.data
  },

  /** Get depreciation schedule for a single asset */
  getForAsset: async (assetId: number | string): Promise<DepreciationSchedule> => {
    const res = await apiClient.get<ApiResponse<DepreciationSchedule>>(
      `/reports/depreciation/${assetId}`,
    )
    return res.data.data
  },
}
