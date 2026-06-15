import axios from 'axios'
import ENV from './env.utils'

const api = axios.create({
    baseURL: ENV.API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Global interceptor to clear stale/expired tokens and retry requests anonymously
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      if (typeof window !== "undefined") {
        const storedToken = window.localStorage.getItem("bidlive.auth.access_token");
        if (storedToken) {
          // Clear stale authentication session
          window.localStorage.removeItem("bidlive.auth.access_token");
          window.localStorage.removeItem("bidlive.auth.refresh_token");
          window.localStorage.removeItem("bidlive.auth.user");
          
          delete api.defaults.headers.common.Authorization;
          if (originalRequest.headers) {
            delete originalRequest.headers.Authorization;
          }
          
          // Retry request anonymously
          return api(originalRequest);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api