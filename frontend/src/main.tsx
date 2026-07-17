import './i18n/config'
import App from '@/App.tsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { initTheme } from '@/shared/utils/themes.utils'
import { initLocale } from '@/shared/i18n'
import '@/shared/http/interceptors'

// Initialize the theme before React renders to prevent FOUC
initTheme()

// Apply lang/dir to <html> before React renders (RTL for Arabic)
initLocale()

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
