import { api } from '@/shared/http/api'
import type {
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
    RegisterPayload,
    RegisterResponse,
    ResetPasswordPayload,
    ResetPasswordResponse,
    SwaggerOAuth2TokenRequestPayload,
    SwaggerOAuth2TokenResponse,
    VerifyUserPayload,
    VerifyUserResponse,
} from '../shared/types/auth.types'

class AuthService {
    async register(payload: RegisterPayload): Promise<RegisterResponse> {
        const response = await api.post<RegisterResponse>('/auth/register/', payload)
        return response.data
    }

    async login(payload: LoginPayload): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login/', payload)
        return response.data
    }

    async refresh(payload: string): Promise<RefreshResponse> {
        if (!payload) {
            throw new Error('Refresh token ausente.')
        }

        const response = await api.post<RefreshResponse>('/auth/refresh/', {
            refresh_token: payload,
        })

        return response.data
    }

    async logout(payload?: string | null): Promise<LogoutResponse> {
        const body = payload ? { refresh_token: payload } : {}
        const response = await api.post<LogoutResponse>('/auth/logout/', body)
        return response.data
    }

    async me(): Promise<MeResponse> {
        const response = await api.get<MeResponse>('/auth/me/')
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

    async verifyUser(payload: VerifyUserPayload): Promise<VerifyUserResponse> {
        const response = await api.post<VerifyUserResponse>('/auth/verify-user/', payload)
        return response.data
    }

    async loginWithGoogle(payload: GoogleLoginPayload): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/google/', payload)
        return response.data
    }

    async loginWithGoogleCallback(
        payload: Pick<GoogleLoginPayload, 'code' | 'redirect_uri'>,
    ): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/google/callback/', payload)
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

        return response.data
    }
}

const authService = new AuthService()

export default authService