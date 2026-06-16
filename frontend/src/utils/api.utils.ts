import axios from 'axios'
import ENV from './env.utils'

const api = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// ── Request interceptor ───────────────────────────────────────────────────────
// Read the token from Zustand store (which is always current) before every
// request so we never rely on a stale header set at startup.
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        // Lazy-import to avoid circular deps — Zustand store is a singleton
        // so getState() is safe to call outside a React component.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/store/auth.store') as typeof import('@/store/auth.store')
        const token = useAuthStore.getState().accessToken

        if (token) {
            config.headers = config.headers ?? {}
            config.headers.Authorization = `Bearer ${token}`
        }
    }
    return config
})

// ── Response interceptor ──────────────────────────────────────────────────────
// On 401 clear the stale session so the user is prompted to log in again.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true
            if (typeof window !== 'undefined') {
                const { useAuthStore } = require('@/store/auth.store') as typeof import('@/store/auth.store')
                const state = useAuthStore.getState()

                if (state.accessToken) {
                    // Attempt a token refresh first
                    try {
                        await state.refresh()
                        // Retry with the new token (interceptor will add it)
                        return api(originalRequest)
                    } catch {
                        // Refresh failed — reset session
                        state.reset()
                    }
                }
            }
        }
        return Promise.reject(error)
    }
)

export default api