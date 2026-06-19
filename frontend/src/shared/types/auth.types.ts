/**
 * Authentication Types for BidLive
 * Based on backend: apps/users, dj-rest-auth, rest_framework_simplejwt
 */

// ============================================================================
// ENUMS
// ============================================================================

export const UserStatus = {
  ACTIVE: "ACTIVE",
  BANNED: "BANNED",
  SUSPENDED: "SUSPENDED",
} as const;

export type UserStatus = typeof UserStatus[keyof typeof UserStatus];

export const UserRole = {
  VISITOR: "VISITOR",
  USER: "USER",
  MONITOR: "MONITOR",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export const OAuthProvider = {
  GOOGLE: "GOOGLE",
  SCHOOL_42: "42",
} as const;

export type OAuthProvider = typeof OAuthProvider[keyof typeof OAuthProvider];

export const AuthErrorCode = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  USERNAME_ALREADY_EXISTS: "USERNAME_ALREADY_EXISTS",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  ACCOUNT_BANNED: "ACCOUNT_BANNED",
  VERIFICATION_REQUIRED: "VERIFICATION_REQUIRED",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  OAUTH_VALIDATION_FAILED: "OAUTH_VALIDATION_FAILED",
  OAUTH_ACCOUNT_ALREADY_LINKED: "OAUTH_ACCOUNT_ALREADY_LINKED",
  OAUTH_EMAIL_MISMATCH: "OAUTH_EMAIL_MISMATCH",
} as const;

export type AuthErrorCode = typeof AuthErrorCode[keyof typeof AuthErrorCode];

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  is_verified: boolean;
  status: UserStatus;
  is_online: boolean;
  last_seen: string; // ISO 8601 datetime
  last_login_ip: string | null;
  is_active: boolean;
  is_staff: boolean;
  is_deleted: boolean;
  failed_login_attempts: number;
  locked_until: string | null; // ISO 8601 datetime
  roles: UserRole[];
  permissions: string[];
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

export type UserProfile = Omit<User, "failed_login_attempts" | "locked_until" | "is_staff" | "is_deleted">;

export interface UserUpdate {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

// ============================================================================
// AUTHENTICATION CREDENTIALS
// ============================================================================

export interface RegisterPayload {
  email: string;
  username: string;
  full_name: string;
  password: string;
  password_confirm?: string; // For frontend validation
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirm?: string; // For frontend validation
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  uid: string;
  token: string;
  new_password: string;
  new_password_confirm?: string; // For frontend validation
}

// ============================================================================
// JWT TOKENS
// ============================================================================

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number; // seconds
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface DecodedToken {
  token_type: "access" | "refresh";
  exp: number; // Unix timestamp
  iat: number; // Unix timestamp
  jti?: string; // JWT ID for rotation
  user_id: number;
  email: string;
  username: string;
  roles: UserRole[];
  permissions: string[];
}

export interface TokenBlacklistPayload {
  refresh: string;
}

// ============================================================================
// AUTH RESPONSES
// ============================================================================

export interface AuthTokenData {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: User;
}

export interface FortyTwoAuthorizeData {
  authorization_url: string;
  state: string;
  expires_in: number;
}

export interface SwaggerOAuth2TokenRequestPayload {
  grant_type?: string;
  username: string;
  password: string;
  scope?: string;
  client_id?: string;
  client_secret?: string;
}

export interface SwaggerOAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface AuthResponse<T = never> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export type RegisterResponse = AuthResponse<User>;

export type LoginResponse = AuthResponse<AuthTokenData>;

export type RefreshResponse = AuthResponse<AuthTokenData>;

export type LogoutResponse = AuthResponse<Record<string, never>>;

export type MeResponse = AuthResponse<User>;

export interface ChangePasswordMessage {
  message: string;
}

export type ChangePasswordResponse = AuthResponse<Record<string, never>>;

export interface ForgotPasswordMessage {
  message: string;
  message_code?: string;
}

export type ForgotPasswordResponse = AuthResponse<Record<string, never>>;

export type ResetPasswordResponse = AuthResponse<Record<string, never>>;

// ============================================================================
// OAUTH / SOCIAL AUTH
// ============================================================================

export interface GoogleLoginPayload {
  access_token?: string;
  id_token?: string;
  code?: string;
  redirect_uri?: string;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  email_verified: boolean;
}

export interface FortyTwoCallbackPayload {
  code: string;
  state: string;
  redirect_uri?: string;
}

export interface FortyTwoUser {
  id: number;
  email: string;
  login: string; // username
  first_name: string;
  last_name: string;
  image: {
    link: string;
  };
}

export interface OAuth42State {
  state: string;
  expires_at: number; // Unix timestamp
}

export type FortyTwoAuthorizeResponse = AuthResponse<FortyTwoAuthorizeData>;

export interface OAuthAccount {
  id: number;
  provider: OAuthProvider;
  provider_user_id: string;
  user: User;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string; // ISO 8601 datetime
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

export interface OAuthLinkPayload {
  provider: OAuthProvider;
  access_token?: string;
  id_token?: string;
  code?: string;
  redirect_uri?: string;
}

export interface OAuthUnlinkPayload {
  provider: OAuthProvider;
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

export interface Session {
  id: number;
  user: User;
  token_hash: string;
  refresh_jti: string;
  ip_address: string;
  user_agent: string;
  expires_at: string; // ISO 8601 datetime
  is_active: boolean;
  revoked_at: string | null; // ISO 8601 datetime
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

export interface RevokeSessionPayload {
  session_id: number;
}

export interface RevokeAllSessionsPayload {
  exclude_current?: boolean;
}

// ============================================================================
// ROLES & PERMISSIONS
// ============================================================================

export interface Role {
  id: number;
  name: UserRole;
  description: string;
  permissions: Permission[];
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

export interface Permission {
  id: number;
  codename: string;
  description: string;
  category: string; // e.g., "auction", "chat", "user", "role"
}

export interface UserPermissions {
  user_id: number;
  roles: Role[];
  permissions: Permission[];
  is_admin: boolean;
  can_moderate: boolean;
}

// ============================================================================
// VALIDATION RULES
// ============================================================================

export interface PasswordValidationRules {
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_digits: boolean;
  require_special_chars: boolean;
  common_passwords_blocked: boolean;
  cannot_contain_email: boolean;
  cannot_contain_username: boolean;
}

export interface UsernameValidationRules {
  min_length: number;
  max_length: number;
  pattern: string; // regex pattern
  reserved_words: string[];
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface AuthError {
  code: AuthErrorCode | string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string; // ISO 8601 datetime
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface FieldErrors {
  [key: string]: string[];
}

// ============================================================================
// SECURITY RELATED
// ============================================================================

export interface BruteForceProtection {
  max_attempts: number;
  lockout_duration: number; // seconds
  attempt_window: number; // seconds
}

export interface TokenRotationConfig {
  enabled: boolean;
  blacklist_on_refresh: boolean;
  max_tokens_per_user: number;
}

export interface AuthConfig {
  jwt_access_token_lifetime: number; // seconds
  jwt_refresh_token_lifetime: number; // seconds
  password_validation_rules: PasswordValidationRules;
  username_validation_rules: UsernameValidationRules;
  brute_force_protection: BruteForceProtection;
  token_rotation: TokenRotationConfig;
  oauth_providers: {
    google: {
      enabled: boolean;
      client_id: string;
    };
    school_42: {
      enabled: boolean;
      client_id: string;
    };
  };
}

// ============================================================================
// API REQUEST/RESPONSE WRAPPERS
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  [key: string]: unknown;
}

// ============================================================================
// LOCAL STORAGE / STATE TYPES
// ============================================================================

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiration: number | null; // Unix timestamp
  isLoading: boolean;
  error: AuthError | null;
}

export interface AuthContextType {
  state: AuthState;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  loginWithGoogle: (payload: GoogleLoginPayload) => Promise<void>;
  loginWith42: (payload: FortyTwoCallbackPayload) => Promise<void>;
  updateProfile: (payload: UserUpdate) => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<void>;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).id === "number" &&
    typeof (obj as Record<string, unknown>).email === "string" &&
    typeof (obj as Record<string, unknown>).username === "string" &&
    Array.isArray((obj as Record<string, unknown>).roles) &&
    Array.isArray((obj as Record<string, unknown>).permissions)
  );
}

export function isAuthError(obj: unknown): obj is AuthError {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).code === "string" &&
    typeof (obj as Record<string, unknown>).message === "string"
  );
}

export function isTokenPair(obj: unknown): obj is TokenPair {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).access_token === "string" &&
    typeof (obj as Record<string, unknown>).refresh_token === "string" &&
    (obj as Record<string, unknown>).token_type === "Bearer" &&
    typeof (obj as Record<string, unknown>).expires_in === "number"
  );
}

export function isAuthResponse<T = never>(obj: unknown): obj is AuthResponse<T> {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).success === "boolean" &&
    typeof (obj as Record<string, unknown>).message === "string"
  );
}

// ============================================================================
// UTILITY TYPE HELPERS
// ============================================================================

export type OptionalUser = User | null | undefined;
export type OptionalTokenPair = TokenPair | null | undefined;
export type DecodedTokenPayload = Omit<DecodedToken, "token_type" | "exp" | "iat">;
