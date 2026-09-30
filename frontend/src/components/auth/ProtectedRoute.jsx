import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'

export default function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  // Wait until /auth/me finishes
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        Checking authentication...
      </div>
    )
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/users/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // Logged in but wrong role
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user?.role)
  ) {
    return <Navigate to="/" replace />
  }

  return children
}