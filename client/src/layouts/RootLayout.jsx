import { Outlet, Link } from 'react-router-dom'

export default function RootLayout() {
  return (
    <>
      <nav>
        <Link to="/login">Login</Link> | <Link to="/chat">Chat</Link>
      </nav>

      <hr />

      <Outlet />
    </>
  )
}
