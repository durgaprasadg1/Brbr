import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'

import HomePage from './pages/HomePage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import OwnerDashboardPage from './pages/OwnerDashboardPage.jsx'
import OwnerShopPage from './pages/OwnerShopPage.jsx'
import CustomerShopPage from './pages/CustomerShopPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

import { AuthProvider } from './context/AuthContext.jsx'
import PublicOnlyRoute from './components/auth/PublicOnlyRoute.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'

import './App.css'

function LegacyShopRedirect({ owner = false }) {
  const { shopId } = useParams()
  const basePath = owner ? '/owners/shops' : '/users/shops'

  return <Navigate to={`${basePath}/${shopId}`} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/users" element={<HomePage />} />
          <Route path="/users/shops/:shopId" element={<CustomerShopPage />} />

          <Route
            path="/users/login"
            element={
              <PublicOnlyRoute>
                <AuthPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/users/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/admins/login"
            element={
              <PublicOnlyRoute>
                <AdminLoginPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/owners/dashboard"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owners/shops/:shopId"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerShopPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admins/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Keep legacy URLs working for existing bookmarks. */}
          <Route path="/shops/:shopId" element={<LegacyShopRedirect />} />
          <Route path="/login" element={<Navigate to="/users/login" replace />} />
          <Route path="/register" element={<Navigate to="/users/register" replace />} />
          <Route path="/admin/login" element={<Navigate to="/admins/login" replace />} />
          <Route path="/owner" element={<Navigate to="/owners/dashboard" replace />} />
          <Route path="/owner/shops/:shopId" element={<LegacyShopRedirect owner />} />
          <Route path="/admin" element={<Navigate to="/admins/dashboard" replace />} />

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}