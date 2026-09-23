import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './rtl.css'
import './i18n'
import App from './App.tsx'

if (!import.meta.env.VITE_TMDB_API_KEY) {
  // Early env validation — helps newcomers who forgot to copy .env.example
  console.warn('[Onyxax] Missing VITE_TMDB_API_KEY — UI will show empty states. See .env.example');
}
if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('[Onyxax] Missing Supabase env — auth will fail. See .env.example');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
