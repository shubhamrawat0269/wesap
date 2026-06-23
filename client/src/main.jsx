import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import router from './Routes.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Toaster position="top-center" />
    <RouterProvider router={router} />
  </StrictMode>
)
