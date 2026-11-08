import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/geist'
import '@fontsource-variable/jetbrains-mono'
import '../styles/tokens.css'
import '../styles/base.css'
import { KmPage } from './KmPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KmPage />
  </StrictMode>,
)
