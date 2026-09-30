import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'

import Brand from '../components/Brand.jsx'

import {
  requestLoginOtp,
  verifyLoginOtp,
} from '../services/api.js'

import { useAuth } from '../context/AuthContext.jsx'

export default function AuthPage() {
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
        setNotice('Please enter a valid email address.')
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

      setUser(result.user)

      if (result.user?.role === 'ADMIN') {
        navigate('/admins/dashboard', { replace: true })
      } else if (result.user?.role === 'OWNER') {
        navigate('/owners/dashboard', { replace: true })
      } else {
        navigate('/users', { replace: true })
      }
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <header className="auth-topbar">
        <Brand />

        <div className="register-login-link">
          <span>Don't have an account?</span>

          <Link to="/users/register" className="quiet-link">
            Register <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <div className="auth-content">
        <section className="auth-intro">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            WELCOME BACK TO CHAIRSIDE
          </div>

          <h1>
            Your next great
            <br />
            <span>cut awaits.</span>
          </h1>

          <p>
            Log in to manage your queue, appointments and
            barber visits — all from one place.
          </p>

          <div className="intro-note">
            <div className="note-icon">
              <Clock3 size={18} />
            </div>

            <span>
              <strong>Your time, in good hands.</strong>
              <br />
              A better way to get to the barber.
            </span>
          </div>

          <div className="intro-decoration">
            <span>01</span>
            <div />
            <span>02</span>
            <div />
            <span>03</span>
          </div>
        </section>

        <section
          className="auth-card"
          aria-labelledby="login-title"
        >
          <div className="card-kicker">
            {otpStep
              ? 'VERIFY YOUR EMAIL'
              : 'WELCOME BACK'}
          </div>

          <h2 id="login-title">
            {otpStep
              ? 'Enter your code.'
              : 'Log in to your account.'}
          </h2>

          <p className="card-subtitle">
            {otpStep
              ? `We sent a verification code to ${email}.`
              : 'Enter your email address to receive a secure login code.'}
          </p>

          <form onSubmit={handleSubmit}>
            {!otpStep ? (
              <>
                <label
                  className="field-label"
                  htmlFor="login-email"
                >
                  Email address
                </label>

                <input
                  id="login-email"
                  className="text-input full-input"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                />
              </>
            ) : (
              <>
                <label
                  className="field-label"
                  htmlFor="login-otp"
                >
                  One-time passcode
                </label>

                <input
                  id="login-otp"
                  className="text-input full-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter the 6-digit code"
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
                  ? 'Verify & log in'
                  : 'Continue with email'}

              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {notice && (
            <div className="inline-notice" role="status">
              {notice}
            </div>
          )}

          <div className="auth-separator">
            <span />
            <small>SECURE BY DESIGN</small>
            <span />
          </div>

          <p className="account-switch">
            Don't have an account?{' '}
            <Link to="/users/register">Create one</Link>
          </p>
        </section>
      </div>

      <footer className="auth-footer">
        <span>© 2025 Chairside</span>

        <span>
          {otpStep
            ? 'Enter the code sent to your email.'
            : 'Secure email authentication.'}
        </span>
      </footer>
    </main>
  )
}