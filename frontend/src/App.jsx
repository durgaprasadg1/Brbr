import { BrowserRouter, Route, Routes } from 'react-router-dom'

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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/shops/:shopId" element={<CustomerShopPage />} />

          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <AuthPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/admin/login"
            element={
              <PublicOnlyRoute>
                <AdminLoginPage />
              </PublicOnlyRoute>
            }
          />

          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/owner/shops/:shopId"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerShopPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<NotFoundPage />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}