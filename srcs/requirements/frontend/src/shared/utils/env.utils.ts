

const ENV = {
    API_URL: import.meta.env.VITE_API_URL || '',
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
    WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || '',
    LIVEKIT_URL: import.meta.env.VITE_LIVEKIT_URL || '',
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
}

export default ENV