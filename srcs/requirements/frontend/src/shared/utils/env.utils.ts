

const isBrowser = typeof window !== 'undefined';
const wsProto = isBrowser && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const host = isBrowser ? window.location.host : '';

const ENV = {
    API_URL: import.meta.env.VITE_API_URL || '/api',
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
    WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || (host ? `${wsProto}//${host}` : ''),
    LIVEKIT_URL: import.meta.env.VITE_LIVEKIT_URL || (host ? `${wsProto}//${host}/livekit` : ''),
    GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
};

export default ENV;