import { useContext } from 'react'
import { AssetContext } from '../contexts/AssetContext'

export function useAssets() {
  const ctx = useContext(AssetContext)
  if (!ctx) throw new Error('useAssets must be used within AssetProvider')
  return ctx
}
