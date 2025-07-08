import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { CVIProvider } from './components/cvi/components/cvi-provider'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CVIProvider>
      <App />
    </CVIProvider>
  </StrictMode>,
)
