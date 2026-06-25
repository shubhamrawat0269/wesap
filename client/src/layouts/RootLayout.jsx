import { Outlet, Link } from 'react-router-dom'
import useUserStore from '../store/useUserStore'
import { useEffect } from 'react'
import {
  disconnectSocket,
  initializeSocket,
} from '../services/chat.service'

export default function RootLayout() {
  const { user } = useUserStore()

  useEffect(() => {
    if (user?._id) {
      const socket = initializeSocket()
    }

    return () => {
      disconnectSocket()
    }
  }, [user])

  return (
    <>
      <Outlet />
    </>
  )
}
