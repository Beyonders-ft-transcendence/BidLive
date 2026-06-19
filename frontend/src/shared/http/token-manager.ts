const STORAGE_KEYS = {
  accessToken: 'bidlive.auth.access_token',
  refreshToken: 'bidlive.auth.refresh_token',
} as const;

class TokenManager {
  getAccessToken() {
    return localStorage.getItem(STORAGE_KEYS.accessToken);
  }

  getRefreshToken() {
    return localStorage.getItem(STORAGE_KEYS.refreshToken);
  }

  setTokens(tokens: {
    accessToken: string;
    refreshToken: string;
  }) {
    localStorage.setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    localStorage.setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
  }

  clear() {
    localStorage.removeItem(STORAGE_KEYS.accessToken);
    localStorage.removeItem(STORAGE_KEYS.refreshToken);
  }
}

export const tokenManager = new TokenManager();