import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CropCompass from './CropCompass'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CropCompass />
  </StrictMode>
)