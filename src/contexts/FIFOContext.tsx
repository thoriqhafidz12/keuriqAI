import { createContext, useMemo, type ReactNode } from 'react'
import type { FIFOResult } from '../types'
import { useTransactions } from '../hooks/useTransactions'
import { computeFIFO } from '../utils/fifo'

interface FIFOContextValue {
  fifoResult: FIFOResult
}

export const FIFOContext = createContext<FIFOContextValue | null>(null)

export function FIFOProvider({ children }: { children: ReactNode }) {
  const { transactions } = useTransactions()

  const fifoResult = useMemo(() => computeFIFO(transactions), [transactions])

  return <FIFOContext.Provider value={{ fifoResult }}>{children}</FIFOContext.Provider>
}
