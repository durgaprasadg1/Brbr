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
    return (
      <Navigate
        to={user?.role === 'ADMIN' ? '/admin' : '/'}
        replace
      />
    )
  }

  return children
}