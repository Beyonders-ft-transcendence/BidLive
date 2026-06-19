import api from '../utils/api.utils'
import type {
    AuthTokenData,
    ChangePasswordPayload,
    ChangePasswordResponse,
    FortyTwoAuthorizeResponse,
    FortyTwoCallbackPayload,
    ForgotPasswordPayload,
    ForgotPasswordResponse,
    GoogleLoginPayload,
    LoginPayload,
    LoginResponse,
    LogoutResponse,
    MeResponse,
    RefreshResponse,
    RefreshTokenPayload,
    RegisterPayload,
    RegisterResponse,
    ResetPasswordPayload,
    ResetPasswordResponse,
    SwaggerOAuth2TokenRequestPayload,
    SwaggerOAuth2TokenResponse,
    User,
} from '../types/auth.types'

type StoredAuthSession = {
    accessToken: string
    refreshToken: string
    user: User
}

const STORAGE_KEYS = {
    accessToken: 'bidlive.auth.access_token',
    refreshToken: 'bidlive.auth.refresh_token',
    user: 'bidlive.auth.user',
} as const

class AuthService {
    constructor() {
        this.hydrateAuthorizationHeader()
    }

    private isBrowser() {
        return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
    }

    private readStorage(key: string) {
        if (!this.isBrowser()) {
            return null
        }

        return window.localStorage.getItem(key)
    }

    private writeStorage(key: string, value: string) {
        if (!this.isBrowser()) {
            return
        }

        window.localStorage.setItem(key, value)
    }

    private removeStorage(key: string) {
        if (!this.isBrowser()) {
            return
        }

        window.localStorage.removeItem(key)
    }

    private setAuthorizationHeader(accessToken: string | null) {
        if (accessToken) {
            api.defaults.headers.common.Authorization = `Bearer ${accessToken}`
            return
        }

        delete api.defaults.headers.common.Authorization
    }

    private hydrateAuthorizationHeader() {
        const storedAccessToken = this.getAccessToken()
        this.setAuthorizationHeader(storedAccessToken)
    }

    private persistUser(user: User) {
        this.writeStorage(STORAGE_KEYS.user, JSON.stringify(user))
    }

    private persistTokens(payload: Pick<AuthTokenData, 'access_token' | 'refresh_token'>) {
        this.writeStorage(STORAGE_KEYS.accessToken, payload.access_token)
        this.writeStorage(STORAGE_KEYS.refreshToken, payload.refresh_token)
        this.setAuthorizationHeader(payload.access_token)
    }

    private persistSession(session: StoredAuthSession) {
        this.persistTokens({
            access_token: session.accessToken,
            refresh_token: session.refreshToken,
        })
        this.persistUser(session.user)
    }

    private clearSession() {
        this.removeStorage(STORAGE_KEYS.accessToken)
        this.removeStorage(STORAGE_KEYS.refreshToken)
        this.removeStorage(STORAGE_KEYS.user)
        this.setAuthorizationHeader(null)
    }

    private normalizeRefreshToken(input?: RefreshTokenPayload | string | null) {
        if (typeof input === 'string') {
            return input
        }

        if (input && typeof input === 'object') {
            return input.refresh_token
        }

        return this.getRefreshToken()
    }

    private extractSessionFromAuthData(payload: AuthTokenData): StoredAuthSession {
        return {
            accessToken: payload.access_token,
            refreshToken: payload.refresh_token,
            user: payload.user,
        }
    }

    getAccessToken() {
        return this.readStorage(STORAGE_KEYS.accessToken)
    }

    getRefreshToken() {
        return this.readStorage(STORAGE_KEYS.refreshToken)
    }

    getStoredUser() {
        const rawUser = this.readStorage(STORAGE_KEYS.user)

        if (!rawUser) {
            return null
        }

        try {
            return JSON.parse(rawUser) as User
        } catch {
            return null
        }
    }

    getSession(): StoredAuthSession | null {
        const accessToken = this.getAccessToken()
        const refreshToken = this.getRefreshToken()
        const user = this.getStoredUser()

        if (!accessToken || !refreshToken || !user) {
            return null
        }

        return {
            accessToken,
            refreshToken,
            user,
        }
    }

    isAuthenticated() {
        return Boolean(this.getAccessToken() && this.getRefreshToken())
    }

    setAccessToken(accessToken: string) {
        this.writeStorage(STORAGE_KEYS.accessToken, accessToken)
        this.setAuthorizationHeader(accessToken)
    }

    setRefreshToken(refreshToken: string) {
        this.writeStorage(STORAGE_KEYS.refreshToken, refreshToken)
    }

    setStoredUser(user: User) {
        this.persistUser(user)
    }

    clearAuth() {
        this.clearSession()
    }

    async register(payload: RegisterPayload): Promise<RegisterResponse> {
        const response = await api.post<RegisterResponse>('/auth/register/', payload)

        if (response.data.data) {
            this.persistUser(response.data.data)
        }

        return response.data
    }

    async login(payload: LoginPayload): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login/', payload)

        if (response.data.data) {
            this.persistSession(this.extractSessionFromAuthData(response.data.data))
        }

        return response.data
    }

    async refresh(payload?: RefreshTokenPayload | string | null): Promise<RefreshResponse> {
        const refreshToken = this.normalizeRefreshToken(payload)

        if (!refreshToken) {
            throw new Error('Refresh token ausente.')
        }

        const response = await api.post<RefreshResponse>('/auth/refresh/', {
            refresh_token: refreshToken,
        })

        if (response.data.data) {
            this.persistSession(this.extractSessionFromAuthData(response.data.data))
        }

        return response.data
    }

    async logout(payload?: RefreshTokenPayload | string | null): Promise<LogoutResponse> {
        const refreshToken = this.normalizeRefreshToken(payload)
        const body = refreshToken ? { refresh_token: refreshToken } : {}

        const response = await api.post<LogoutResponse>('/auth/logout/', body)
        this.clearSession()

        return response.data
    }

    async me(): Promise<MeResponse> {
        const response = await api.get<MeResponse>('/auth/me/')

        if (response.data.data) {
            this.persistUser(response.data.data)
        }

        return response.data
    }

    async changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
        const response = await api.post<ChangePasswordResponse>('/auth/change-password/', payload)
        return response.data
    }

    async forgotPassword(payload: ForgotPasswordPayload): Promise<ForgotPasswordResponse> {
        const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password/', payload)
        return response.data
    }

    async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
        const response = await api.post<ResetPasswordResponse>('/auth/reset-password/', payload)
        return response.data
    }

    async loginWithGoogle(payload: GoogleLoginPayload): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/google/', payload)

        if (response.data.data) {
            this.persistSession(this.extractSessionFromAuthData(response.data.data))
        }

        return response.data
    }

    async loginWithGoogleCallback(
        payload: Pick<GoogleLoginPayload, 'code' | 'redirect_uri'>,
    ): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/google/callback/', payload)

        if (response.data.data) {
            this.persistSession(this.extractSessionFromAuthData(response.data.data))
        }

        return response.data
    }

    async googleCallback(
        payload: Pick<GoogleLoginPayload, 'code' | 'redirect_uri'>,
    ): Promise<LoginResponse> {
        return this.loginWithGoogleCallback(payload)
    }

    async authorizeFortyTwo(): Promise<FortyTwoAuthorizeResponse> {
        const response = await api.get<FortyTwoAuthorizeResponse>('/auth/42/')
        return response.data
    }

    async authorize42(): Promise<FortyTwoAuthorizeResponse> {
        return this.authorizeFortyTwo()
    }

    async loginWith42(payload: FortyTwoCallbackPayload): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/42/callback/', payload)

        if (response.data.data) {
            this.persistSession(this.extractSessionFromAuthData(response.data.data))
        }

        return response.data
    }

    async loginWith42Callback(payload: FortyTwoCallbackPayload): Promise<LoginResponse> {
        return this.loginWith42(payload)
    }

    async getSwaggerToken(
        payload: SwaggerOAuth2TokenRequestPayload,
    ): Promise<SwaggerOAuth2TokenResponse> {
        const formData = new URLSearchParams()

        formData.set('grant_type', payload.grant_type ?? 'password')
        formData.set('username', payload.username)
        formData.set('password', payload.password)

        if (payload.scope) {
            formData.set('scope', payload.scope)
        }

        if (payload.client_id) {
            formData.set('client_id', payload.client_id)
        }

        if (payload.client_secret) {
            formData.set('client_secret', payload.client_secret)
        }

        const response = await api.post<SwaggerOAuth2TokenResponse>('/auth/swagger-token/', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        this.setAccessToken(response.data.access_token)
        this.setRefreshToken(response.data.refresh_token)

        return response.data
    }
}

const authService = new AuthService()

export default authService