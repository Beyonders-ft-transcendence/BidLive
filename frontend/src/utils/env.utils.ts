

const ENV = {
    API_URL: process.env.NEXT_PUBLIC_API_URL || '',
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || '',
    WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL || '',
    LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL || '',
    GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
}

export default ENV