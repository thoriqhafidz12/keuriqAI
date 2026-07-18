import apiClient from './client'
import type { ApiResponse, AuthPayload, LoginRequest, RegisterRequest, User } from './types'

export const authApi = {
  /** Register a new account — returns Paseto access + refresh token pair */
  register: async (data: RegisterRequest): Promise<AuthPayload> => {
    const res = await apiClient.post<ApiResponse<AuthPayload>>('/auth/register', data)
    return res.data.data
  },

  /** Login with email and password — returns Paseto access + refresh token pair */
  login: async (data: LoginRequest): Promise<AuthPayload> => {
    const res = await apiClient.post<ApiResponse<AuthPayload>>('/auth/login', data)
    return res.data.data
  },

  /** Get current session / authenticated user via Better Auth token */
  getSession: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/session')
    return res.data.data.user
  },

  /** Refresh access token using refresh token (one-time use, rotated) */
  refresh: async (refreshToken: string): Promise<AuthPayload> => {
    const res = await apiClient.post<ApiResponse<AuthPayload>>('/auth/refresh', {
      refresh_token: refreshToken,
    })
    return res.data.data
  },

  /** Logout — revoke all refresh tokens */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },
}
