import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import userStore from './store/useUserStore.js'
import { checkUserAuth } from './services/user.service.js'
import useUserStore from './store/useUserStore.js'
import Loader from './utils/Loader.jsx'

export const ProtectedRoute = ({ children }) => {
  const location = useLocation()

  const [isChecking, setIsChecking] = useState(true)

  const { isAuthenticated, setUser, clearUser } = useUserStore()

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const result = await checkUserAuth()
        if (result?.isAuthenticated) setUser(result.user)
        else clearUser()
      } catch (error) {
        console.error(error)
        clearUser()
      } finally {
        setIsChecking(false)
      }
    }

    verifyAuth()
  }, [setUser, clearUser])

  if (isChecking) return <Loader />
  if (!isAuthenticated) {
    return (
      <Navigate to={`/login`} state={{ from: location }} replace />
    )
  }

  return children
}

export const PublicRoute = ({ children }) => {
  const isAuthenticated = useUserStore(
    (state) => state.isAuthenticated
  )
  if (isAuthenticated) {
    return <Navigate to={'/'} replace />
  }

  return children ?? <Outlet />
}
