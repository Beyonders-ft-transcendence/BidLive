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
