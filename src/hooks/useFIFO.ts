import { useContext } from 'react'
import { FIFOContext } from '../contexts/FIFOContext'

export function useFIFO() {
  const ctx = useContext(FIFOContext)
  if (!ctx) throw new Error('useFIFO must be used within FIFOProvider')
  return ctx
}
