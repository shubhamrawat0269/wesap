import { createBrowserRouter } from 'react-router-dom'
import Home from './pages/dashboard/Home'

import Chat from './pages/chats/Chat'
import Login from './pages/auth/Login'
import RootLayout from './layouts/RootLayout'
import NotFound from './pages/not-found/NotFound'
import { ProtectedRoute, PublicRoute } from './Protected'
import UserDetails from './pages/user-details/UserDetails'
import Status from './pages/status/Status'
import Settings from './pages/settings/Settings'

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '',
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: 'user-profile',
        element: (
          <ProtectedRoute>
            <UserDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: 'status',
        element: (
          <ProtectedRoute>
            <Status />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'chat',
        element: (
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '/login',
    errorElement: <NotFound />,
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
    errorElement: <NotFound />,
  },
])

export default router
