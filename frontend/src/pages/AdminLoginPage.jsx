import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'

import Brand from '../components/Brand.jsx'

import { useAuth } from '../context/AuthContext.jsx'

import {
  requestLoginOtp,
  verifyLoginOtp,
} from '../services/api.js'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpStep, setOtpStep] = useState(false)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const { setUser } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setNotice('')

    if (!otpStep) {
      if (!email.trim() || !email.includes('@')) {
        setNotice('Please enter a valid admin email address.')
        return
      }

      try {
        setLoading(true)

        const result = await requestLoginOtp(
          email.trim().toLowerCase()
        )

        setOtpStep(true)

        setNotice(
          result.message || 'OTP sent to your email.'
        )
      } catch (error) {
        setNotice(error.message)
      } finally {
        setLoading(false)
      }

      return
    }

    if (otp.length !== 6) {
      setNotice('Please enter the 6-digit OTP.')
      return
    }

    try {
      setLoading(true)

      const result = await verifyLoginOtp(
        email.trim().toLowerCase(),
        otp
      )

      // Only ADMIN can access the admin dashboard
      if (result.user?.role !== 'ADMIN') {
        setNotice(
          'Access denied. This account is not an administrator.'
        )
        return
      }

      setUser(result.user)

      navigate('/admins/dashboard', { replace: true })
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-login-shell">
      <header className="auth-topbar">
        <Brand />

        <Link
          to="/users/login"
          className="quiet-link"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </header>

      <section className="admin-login-card">
        <div className="admin-login-emblem">
          <ShieldCheck size={24} />
        </div>

        <div className="card-kicker">
          CHAIRSIDE CONTROL ROOM
        </div>

        <h1>Administrator sign in</h1>

        <p className="card-subtitle">
          Use your administrator email to continue.
        </p>

        <form onSubmit={handleSubmit}>
          {!otpStep ? (
            <>
              <label
                className="field-label"
                htmlFor="admin-email"
              >
                Administrator email
              </label>

              <input
                className="text-input full-input"
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="admin@example.com"
                required
              />
            </>
          ) : (
            <>
              <label
                className="field-label"
                htmlFor="admin-otp"
              >
                One-time passcode
              </label>

              <input
                className="text-input full-input"
                id="admin-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="Enter the 6-digit OTP"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value
                      .replace(/\D/g, '')
                      .slice(0, 6)
                  )
                }
                required
              />

              <button
                type="button"
                className="back-link"
                onClick={() => {
                  setOtpStep(false)
                  setOtp('')
                  setNotice('')
                }}
                disabled={loading}
              >
                <ArrowLeft size={14} />
                Change email
              </button>
            </>
          )}

          <button
            className="primary-button"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : otpStep
                ? 'Verify & continue'
                : 'Send OTP'}

            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {notice && (
          <div
            className="inline-notice"
            role="status"
          >
            {notice}
          </div>
        )}

        <div className="auth-separator">
          <span />
          <small>ADMIN ACCESS</small>
          <span />
        </div>

        <p className="admin-login-foot">
          <ShieldCheck size={14} />
          Protected access for authorized administrators
        </p>
      </section>

      <footer className="auth-footer">
        <span>© 2025 Chairside</span>

        <span>
          Administrator access requires a verified ADMIN account.
        </span>
      </footer>
    </main>
  )
}