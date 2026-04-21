import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { QueryProvider } from '@/app/providers/query-provider'
import { QuickActionProvider } from '@/app/providers/quick-action-provider'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <QuickActionProvider>
        <App />
      </QuickActionProvider>
    </QueryProvider>
  </StrictMode>,
)
