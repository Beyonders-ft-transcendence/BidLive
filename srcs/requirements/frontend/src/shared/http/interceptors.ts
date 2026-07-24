import { api } from "./api";
import { useAuthStore } from "@/shared/stores/auth.store";
import axios, { AxiosError } from "axios";

api.interceptors.request.use(
  (config) => {
    // Busca o token diretamente do estado do Zustand (que já gere o storage)
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest.url?.includes('/auth/refresh/')) {
        const refreshToken = useAuthStore.getState().refreshToken;
        
        if (refreshToken) {
            try {
                const response = await axios.post(`${api.defaults.baseURL}/auth/refresh/`, {
                    refresh_token: refreshToken
                });
                
                if (response.data?.data) {
                    const { access_token, refresh_token } = response.data.data;
                    
                    // Atualiza os tokens diretamente na Store do Zustand
                    useAuthStore.getState().setTokens(access_token, refresh_token);
                    
                    originalRequest.headers.Authorization = `Bearer ${access_token}`;
                    return axios(originalRequest);
                }
            } catch {
                window.dispatchEvent(new Event('bidlive:unauthorized'));
            }
        } else {
            window.dispatchEvent(new Event('bidlive:unauthorized'));
        }
    }

    return Promise.reject(error);
  }
);