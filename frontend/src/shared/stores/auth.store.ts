import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist, createJSONStorage } from 'zustand/middleware'
import authService from '../../services/auth.service'
import { isAxiosError } from 'axios'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import type {
    ChangePasswordPayload,
    FortyTwoCallbackPayload,
    ForgotPasswordPayload,
    GoogleLoginPayload,
    LoginPayload,
    RegisterPayload,
    ResetPasswordPayload,
    SwaggerOAuth2TokenRequestPayload,
    User,
} from '@/shared/types/auth.types'

// ─── State Shape ────────────────────────────────────────────────────────────

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

interface AuthState {
    // ── Data ──────────────────────────────────────────────────────────────────
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    status: AuthStatus
    error: string | null

    // ── Derived helpers (computed via selectors) ──────────────────────────────
    isAuthenticated: boolean
    isLoading: boolean
}

// ─── Actions Shape ───────────────────────────────────────────────────────────

interface AuthActions {
    // ── Core auth ─────────────────────────────────────────────────────────────
    register: (payload: RegisterPayload) => Promise<void>
    login: (payload: LoginPayload) => Promise<void>
    logout: () => Promise<void>
    refresh: (token?: string) => Promise<void>
    fetchMe: () => Promise<void>

    // ── Password management ───────────────────────────────────────────────────
    changePassword: (payload: ChangePasswordPayload) => Promise<void>
    forgotPassword: (payload: ForgotPasswordPayload) => Promise<void>
    resetPassword: (payload: ResetPasswordPayload) => Promise<void>

    // ── Social / OAuth ────────────────────────────────────────────────────────
    loginWithGoogle: (payload: GoogleLoginPayload) => Promise<void>
    loginWithGoogleCallback: (payload: Pick<GoogleLoginPayload, 'code' | 'redirect_uri'>) => Promise<void>
    authorizeFortyTwo: () => Promise<string>
    loginWith42: (payload: FortyTwoCallbackPayload) => Promise<void>

    // ── Swagger OAuth2 ────────────────────────────────────────────────────────
    getSwaggerToken: (payload: SwaggerOAuth2TokenRequestPayload) => Promise<void>

    // ── Internal / utility ───────────────────────────────────────────────────
    hydrateFromStorage: () => void
    setUser: (user: User) => void
    updateUser: (user: Partial<User>) => void
    setTokens: (accessToken: string, refreshToken: string) => void
    clearError: () => void
    reset: () => void
}

export type AuthStore = AuthState & AuthActions

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (isAxiosError(error)) {
        const responseData = error.response?.data as any;

        if (typeof responseData === 'string') return responseData;

        if (responseData && typeof responseData === 'object') {
            if (typeof responseData.message === 'string') return responseData.message;
            if (typeof responseData.detail === 'string') return responseData.detail;

            const errorSource = responseData.errors || responseData.message || responseData;

            if (errorSource && typeof errorSource === 'object') {
                const values = Object.values(errorSource).flat();
                const firstError = values.find(v => typeof v === 'string');
                if (firstError) return firstError as string;
            }
        }

        return error.message ?? fallback;
    }

    if (error instanceof Error) {
        return error.message || fallback;
    }

    if (typeof error === 'string') {
        return error;
    }

    return fallback;
}

// ─── Initial State ───────────────────────────────────────────────────────────

const getInitialState = (): AuthState => {
    return {
        user: null,
        accessToken: null,
        refreshToken: null,
        status: 'unauthenticated',
        error: null,
        isAuthenticated: false,
        isLoading: false,
    }
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthStore>()(
    devtools(
        subscribeWithSelector(
            persist(
                immer((set, get) => ({
                ...getInitialState(),

                // ── Helpers ─────────────────────────────────────────────────────────

                hydrateFromStorage() {
                    // O Zustand 'persist' já faz a hidratação automaticamente da localStorage/sessionStorage.
                    // Podemos manter esta função vazia ou usá-la se precisarmos de lógicas extras.
                },

                setUser(user) {
                    set((s) => {
                        s.user = user
                    })
                },

                updateUser(partialUser) {
                    set((s) => {
                        if (s.user) {
                            s.user = { ...s.user, ...partialUser }
                        }
                    })
                },

                setTokens(accessToken, refreshToken) {
                    set((s) => {
                        s.accessToken = accessToken
                        s.refreshToken = refreshToken
                        s.isAuthenticated = true
                        s.status = 'authenticated'
                    })
                },

                clearError() {
                    set((s) => {
                        s.error = null
                    })
                },

                reset() {
                    set((s) => {
                        s.user = null
                        s.accessToken = null
                        s.refreshToken = null
                        s.status = 'unauthenticated'
                        s.isAuthenticated = false
                        s.isLoading = false
                        s.error = null
                    })
                },

                // ── Core auth ───────────────────────────────────────────────────────

                async register(payload) {
                    set((s) => {
                        s.status = 'loading'
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const res = await authService.register(payload)
                        if (res.data) {
                            set((s) => {
                                s.user = res.data!
                                s.accessToken = null
                                s.refreshToken = null
                                s.status = 'unauthenticated'
                                s.isAuthenticated = false
                            })
                        }
                    } catch (err: unknown) {
                        set((s) => {
                            s.status = 'error'
                            s.error = getErrorMessage(err, 'Erro ao registrar.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                async login(payload) {
                    set((s) => {
                        s.status = 'loading'
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const res = await authService.login(payload)
                        if (res.data) {
                            set((s) => {
                                s.user = res.data!.user
                                s.accessToken = res.data!.access_token
                                s.refreshToken = res.data!.refresh_token
                                s.status = 'authenticated'
                                s.isAuthenticated = true
                            })
                        }
                    } catch (err: unknown) {
                        set((s) => {
                            s.status = 'error'
                            s.error = getErrorMessage(err, 'Erro ao fazer login.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                async logout() {
                    set((s) => {
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const refreshToken = get().refreshToken
                        if (refreshToken) {
                            await authService.logout(refreshToken)
                        }
                    } catch {
                        // swallow — always clear locally
                    } finally {
                        set((s) => {
                            s.user = null
                            s.accessToken = null
                            s.refreshToken = null
                            s.status = 'unauthenticated'
                            s.isAuthenticated = false
                            s.isLoading = false
                        })
                    }
                },

                async refresh(token) {
                    set((s) => {
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const refreshToken = token ?? get().refreshToken
                        if (!refreshToken) throw new Error('Refresh token não encontrado')
                        
                        const res = await authService.refresh(refreshToken)
                        if (res.data) {
                            set((s) => {
                                s.user = res.data!.user
                                s.accessToken = res.data!.access_token
                                s.refreshToken = res.data!.refresh_token
                                s.status = 'authenticated'
                                s.isAuthenticated = true
                            })
                        }
                    } catch (err: unknown) {
                        set((s) => {
                            s.status = 'error'
                            s.error = getErrorMessage(err, 'Sessão expirada.')
                            s.isAuthenticated = false
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                async fetchMe() {
                    set((s) => {
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const res = await authService.me()
                        if (res.data) {
                            set((s) => {
                                s.user = res.data!
                                s.status = 'authenticated'
                                s.isAuthenticated = true
                            })
                        }
                    } catch (err: unknown) {
                        set((s) => {
                            s.status = 'error'
                            s.error = getErrorMessage(err, 'Erro ao buscar usuário.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                // ── Password management ─────────────────────────────────────────────

                async changePassword(payload) {
                    set((s) => {
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        await authService.changePassword(payload)
                    } catch (err: unknown) {
                        set((s) => {
                            s.error = getErrorMessage(err, 'Erro ao alterar senha.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                async forgotPassword(payload) {
                    set((s) => {
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        await authService.forgotPassword(payload)
                    } catch (err: unknown) {
                        set((s) => {
                            s.error = getErrorMessage(err, 'Erro ao solicitar redefinição.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                async resetPassword(payload) {
                    set((s) => {
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        await authService.resetPassword(payload)
                    } catch (err: unknown) {
                        set((s) => {
                            s.error = getErrorMessage(err, 'Erro ao redefinir senha.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                // ── Social / OAuth ──────────────────────────────────────────────────

                async loginWithGoogle(payload) {
                    set((s) => {
                        s.status = 'loading'
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const res = await authService.loginWithGoogle(payload)
                        if (res.data) {
                            set((s) => {
                                s.user = res.data!.user
                                s.accessToken = res.data!.access_token
                                s.refreshToken = res.data!.refresh_token
                                s.status = 'authenticated'
                                s.isAuthenticated = true
                            })
                        }
                    } catch (err: unknown) {
                        set((s) => {
                            s.status = 'error'
                            s.error = getErrorMessage(err, 'Erro ao autenticar com Google.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                async loginWithGoogleCallback(payload) {
                    set((s) => {
                        s.status = 'loading'
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const res = await authService.loginWithGoogleCallback(payload)
                        if (res.data) {
                            set((s) => {
                                s.user = res.data!.user
                                s.accessToken = res.data!.access_token
                                s.refreshToken = res.data!.refresh_token
                                s.status = 'authenticated'
                                s.isAuthenticated = true
                            })
                        }
                    } catch (err: unknown) {
                        set((s) => {
                            s.status = 'error'
                            s.error = getErrorMessage(err, 'Erro no callback do Google.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                async authorizeFortyTwo() {
                    set((s) => {
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const res = await authService.authorizeFortyTwo()
                        return res.data?.authorization_url ?? ''
                    } catch (err: unknown) {
                        set((s) => {
                            s.error = getErrorMessage(err, 'Erro ao autorizar 42.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                async loginWith42(payload) {
                    set((s) => {
                        s.status = 'loading'
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const res = await authService.loginWith42(payload)
                        if (res.data) {
                            set((s) => {
                                s.user = res.data!.user
                                s.accessToken = res.data!.access_token
                                s.refreshToken = res.data!.refresh_token
                                s.status = 'authenticated'
                                s.isAuthenticated = true
                            })
                        }
                    } catch (err: unknown) {
                        set((s) => {
                            s.status = 'error'
                            s.error = getErrorMessage(err, 'Erro ao autenticar com 42.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },

                // ── Swagger OAuth2 ──────────────────────────────────────────────────

                async getSwaggerToken(payload) {
                    set((s) => {
                        s.isLoading = true
                        s.error = null
                    })
                    try {
                        const res = await authService.getSwaggerToken(payload)
                        set((s) => {
                            s.accessToken = res.access_token
                            s.refreshToken = res.refresh_token
                            s.status = 'authenticated'
                            s.isAuthenticated = true
                        })
                    } catch (err: unknown) {
                        set((s) => {
                            s.error = getErrorMessage(err, 'Erro ao obter token Swagger.')
                        })
                        throw err
                    } finally {
                        set((s) => {
                            s.isLoading = false
                        })
                    }
                },
            })),
            {
                name: 'bidlive-auth',
                storage: createJSONStorage(() =>
                    typeof window !== 'undefined'
                        ? window.localStorage
                        : {
                              getItem: () => null,
                              setItem: () => {},
                              removeItem: () => {},
                          }
                ),
                partialize: (s: AuthStore) => ({
                    user: s.user,
                    accessToken: s.accessToken,
                    refreshToken: s.refreshToken,
                    status: s.status,
                    isAuthenticated: s.isAuthenticated,
                    isLoading: false,
                    error: null,
                }),
            }
        ),
        ),
        { name: 'AuthStore' },
    ),
)

// ─── Selectors ───────────────────────────────────────────────────────────────
// Use these for fine-grained subscriptions to avoid unnecessary re-renders.

export const selectUser = (s: AuthStore) => s.user
export const selectIsAuthenticated = (s: AuthStore) => s.isAuthenticated
export const selectIsLoading = (s: AuthStore) => s.isLoading
export const selectAuthStatus = (s: AuthStore) => s.status
export const selectAuthError = (s: AuthStore) => s.error
export const selectAccessToken = (s: AuthStore) => s.accessToken
export const selectRefreshToken = (s: AuthStore) => s.refreshToken

if (typeof window !== 'undefined') {
    window.addEventListener('bidlive:unauthorized', () => {
        useAuthStore.getState().reset()
    })
}