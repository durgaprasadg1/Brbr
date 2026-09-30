import { Navigate } from 'react-router-dom'

import { useAuth } from '../../context/AuthContext.jsx'

export default function PublicOnlyRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth()

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

  if (isAuthenticated) {
    const destination =
      user?.role === 'ADMIN'
        ? '/admins/dashboard'
        : user?.role === 'OWNER'
          ? '/owners/dashboard'
          : '/users'

    return <Navigate to={destination} replace />
  }

  return children
}