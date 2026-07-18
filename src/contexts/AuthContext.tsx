import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import { authApi } from '../api/authApi'

interface AuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  error: string | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

const ACCESS_TOKEN_KEY = 'keuriqAI:access_token'
const REFRESH_TOKEN_KEY = 'keuriqAI:refresh_token'

function storeTokens(accessToken: string, refreshToken: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

function clearTokens() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)

  // On mount, check if there's a valid session via getSession()
  useEffect(() => {
    const checkSession = async () => {
      const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY)
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        const currentUser = await authApi.getSession()
        setUser(currentUser)
        setIsAuthenticated(true)
      } catch {
        // Token invalid or expired — clear tokens (refresh is handled by client interceptor)
        clearTokens()
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setError(null)
    try {
      const payload = await authApi.login({ email, password })
      storeTokens(payload.access_token, payload.refresh_token)
      setUser(payload.user)
      setIsAuthenticated(true)
      return true
    } catch (err: any) {
      const message = err.response?.data?.message || 'Login gagal. Periksa email dan password.'
      setError(message)
      return false
    }
  }, [])

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> => {
    setError(null)
    try {
      const payload = await authApi.register({
        name,
        email,
        password,
        password_confirmation: password,
      })
      storeTokens(payload.access_token, payload.refresh_token)
      setUser(payload.user)
      setIsAuthenticated(true)
      return true
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registrasi gagal.'
      setError(message)
      return false
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Even if API call fails, clear local state
    }
    clearTokens()
    setIsAuthenticated(false)
    setUser(null)
    setError(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}
