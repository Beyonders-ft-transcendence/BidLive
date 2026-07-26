import './i18n/config'
import App from '@/App.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { setLogLevel, LogLevel } from 'livekit-client'

import { initTheme } from '@/shared/utils/themes.utils'
import '@/shared/http/interceptors'

// Initialize the theme before React renders to prevent FOUC
initTheme()

// Silence LiveKit SDK internal logging
setLogLevel(LogLevel.silent)

// Silence external SDK COOP browser warnings (Google GSI client.js window.closed check)
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  const isCoopMsg = (msg: any) => typeof msg === 'string' && msg.includes('Cross-Origin-Opener-Policy');

  console.warn = (...args: any[]) => {
    if (isCoopMsg(args[0])) return;
    originalWarn.apply(console, args);
  };

  console.error = (...args: any[]) => {
    if (isCoopMsg(args[0])) return;
    originalError.apply(console, args);
  };
}

// O idioma (lang/dir no <html>) e tratado pelo ./i18n/config importado acima

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
