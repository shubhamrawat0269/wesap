import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'

import Login from './pages/auth/Login'
import Chat from './pages/chats/Chat'
import NotFound from './pages/not-found/NotFound'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/chat',
        element: <Chat />,
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
