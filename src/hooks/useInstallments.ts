import { useContext } from 'react'
import { InstallmentContext } from '../contexts/InstallmentContext'

export function useInstallments() {
  const ctx = useContext(InstallmentContext)
  if (!ctx) throw new Error('useInstallments must be used within InstallmentProvider')
  return ctx
}
