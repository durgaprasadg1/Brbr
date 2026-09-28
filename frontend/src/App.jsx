import { BrowserRouter, Route, Routes } from 'react-router-dom'

import HomePage from './pages/HomePage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

import { AuthProvider } from './context/AuthContext.jsx'

import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<AuthPage />} />

          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/admin/login"
            element={<AdminLoginPage />}
          />

          <Route
            path="/admin"
            element={<AdminDashboardPage />}
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