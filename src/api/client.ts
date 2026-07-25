import axios from "axios"

const ACCESS_TOKEN_KEY = 'keuriqAI:access_token'
const REFRESH_TOKEN_KEY = 'keuriqAI:refresh_token'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// ── Request interceptor: attach access token ────────────────────────────
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(ACCESS_TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor: auto-refresh on 401 ───────────────────────────
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string) => void
  reject: (err: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token)
    else reject(error)
  })
  failedQueue = []
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh on 401, and not on auth endpoints themselves
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken = sessionStorage.getItem(REFRESH_TOKEN_KEY)

      if (!refreshToken) {
        // No refresh token — hard redirect to login
        clearTokensAndRedirect()
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return apiClient(originalRequest)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Call refresh endpoint
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { 'Content-Type': 'application/json' } },
        )

        const newAccessToken = data.data.access_token
        const newRefreshToken = data.data.refresh_token

        // Store new tokens
        sessionStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken)
        sessionStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken)

        // Update original request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

        // Process queued requests
        processQueue(null, newAccessToken)

        return apiClient(originalRequest)

      } catch (refreshError) {
        processQueue(refreshError, null)
        clearTokensAndRedirect()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    // If 401 on auth endpoints or refresh failed — redirect to login
    if (error.response?.status === 401) {
      clearTokensAndRedirect()
    }

    return Promise.reject(error)
  },
)

function clearTokensAndRedirect() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

export default apiClient
