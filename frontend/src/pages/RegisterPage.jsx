import { useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'

import Brand from '../components/Brand.jsx'

import RoleSelector from '../components/auth/RoleSelector.jsx'

import { useAuth } from '../context/AuthContext.jsx'

import {
  registerUser,
  verifyRegistrationOtp,
} from '../services/api.js'

export default function RegisterPage() {
  const [role, setRole] = useState('customer')
  const [name, setName] = useState('')
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
      if (name.trim().length < 2) {
        setNotice('Please enter a valid name.')
        return
      }

      if (!email.trim() || !email.includes('@')) {
        setNotice('Please enter a valid email address.')
        return
      }

      try {
        setLoading(true)

        const result = await registerUser({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          role: role.toUpperCase(),
        })

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

      const result = await verifyRegistrationOtp(
        email.trim().toLowerCase(),
        otp
      )

      setUser(result.user)

setNotice(
  result.message || 'Registration successful.'
)

if (result.user?.role === 'ADMIN') {
  navigate('/admin')
} else {
  navigate('/')
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
          <span>Already have an account?</span>

          <Link to="/login" className="quiet-link">
            Log in <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <div className="auth-content">
        <section className="auth-intro">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            YOUR NEXT GREAT CUT STARTS HERE
          </div>

          <h1>
            A better barber
            <br />
            <span>visit starts here.</span>
          </h1>

          <p>
            Create your Chairside account to find your place in line,
            choose services and make more of your time.
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
          className="auth-card register-card"
          aria-labelledby="register-title"
        >
          <div className="card-kicker">
            {otpStep
              ? 'VERIFY YOUR EMAIL'
              : 'JOIN CHAIRSIDE'}
          </div>

          <h2 id="register-title">
            {otpStep
              ? 'Enter your code.'
              : 'Create your account.'}
          </h2>

          <p className="card-subtitle">
            {otpStep
              ? `We sent a verification code to ${email}.`
              : 'Choose your account type and add your details to get started.'}
          </p>

          {!otpStep && (
            <RoleSelector
              selectedRole={role}
              onSelect={(nextRole) => {
                setRole(nextRole)
                setNotice('')
              }}
            />
          )}

          <form onSubmit={handleSubmit}>
            {!otpStep ? (
              <>
                <label
                  className="field-label"
                  htmlFor="register-name"
                >
                  Full name
                </label>

                <input
                  id="register-name"
                  className="text-input full-input"
                  type="text"
                  autoComplete="name"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  required
                />

                <label
                  className="field-label register-phone-label"
                  htmlFor="register-email"
                >
                  Email address
                </label>

                <input
                  id="register-email"
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
                  htmlFor="register-otp"
                >
                  One-time passcode
                </label>

                <input
                  id="register-otp"
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
                  Change details
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
                  ? 'Verify & create account'
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

          <p className="terms">
            By continuing, you agree to our{' '}
            <a href="#terms">Terms</a> and{' '}
            <a href="#privacy">Privacy Policy</a>.
          </p>

          <p className="account-switch">
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </p>
        </section>
      </div>

      <footer className="auth-footer">
        <span>© 2025 Chairside</span>

        <span>
          {otpStep
            ? 'Verify your email to complete registration.'
            : 'Create your account and get started.'}
        </span>
      </footer>
    </main>
  )
}