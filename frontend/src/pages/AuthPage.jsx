import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ChevronDown, Clock3, ShieldCheck } from 'lucide-react'
import Brand from '../components/Brand.jsx'
import RoleSelector from '../components/auth/RoleSelector.jsx'

export default function AuthPage() {
  const [role, setRole] = useState('customer')
  const [phone, setPhone] = useState('')
  const [otpStep, setOtpStep] = useState(false)
  const [notice, setNotice] = useState('')
  const navigate = useNavigate()

  function handleContinue(event) {
    event.preventDefault()
    if (role === 'admin') {
      navigate('/admin/login')
      return
    }
    if (!otpStep) {
      setOtpStep(true)
      setNotice('OTP delivery is not connected yet. This screen is a frontend preview.')
      return
    }
    setNotice('OTP verification is not connected yet. No login was performed.')
  }

  return (
    <main className="auth-shell">
      <header className="auth-topbar"><Brand /><Link to="/admin/login" className="quiet-link">Admin sign in <ArrowRight size={15} /></Link></header>
      <div className="auth-content">
        <section className="auth-intro">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT GREAT CUT STARTS HERE</div>
          <h1>Good hair days,<br /><span>without the wait.</span></h1>
          <p>Sign in to find your place in line, or run your shop with less waiting and more doing.</p>
          <div className="intro-note"><div className="note-icon"><Clock3 size={18} /></div><span><strong>Your time, in good hands.</strong><br />A better way to get to the barber.</span></div>
          <div className="intro-decoration"><span>01</span><div /><span>02</span><div /><span>03</span></div>
        </section>
        <section className="auth-card" aria-labelledby="auth-title">
          <div className="card-kicker">WELCOME TO CHAIRSIDE</div>
          <h2 id="auth-title">{otpStep ? 'Enter your code' : 'Let’s get you in.'}</h2>
          <p className="card-subtitle">{otpStep ? `We’ll verify ${phone || 'your number'} when OTP delivery is connected.` : 'Choose how you use Chairside to continue.'}</p>
          {!otpStep && <RoleSelector selectedRole={role} onSelect={(nextRole) => { setRole(nextRole); setNotice('') }} />}
          <form onSubmit={handleContinue}>
            {!otpStep && role !== 'admin' && <label className="field-label" htmlFor="mobile">Mobile number</label>}
            {otpStep ? <>
              <label className="field-label" htmlFor="otp">One-time passcode</label>
              <input id="otp" className="text-input" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter the 6-digit code" maxLength={6} />
              <button type="button" className="back-link" onClick={() => { setOtpStep(false); setNotice('') }}><ArrowLeft size={14} /> Change mobile number</button>
            </> : role !== 'admin' ? <div className="phone-field"><span className="country-code">🇮🇳 <span>+91</span><ChevronDown size={13} /></span><input id="mobile" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} className="text-input" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" maxLength={10} required /></div> : <div className="admin-forward"><ShieldCheck size={16} /><span>Secure administrator sign-in</span></div>}
            <button className="primary-button" type="submit">{otpStep ? 'Verify code' : role === 'admin' ? 'Continue to admin sign in' : 'Continue with phone'} <ArrowRight size={16} /></button>
          </form>
          {notice && <div className="inline-notice" role="status">{notice}</div>}
          <div className="auth-separator"><span /> <small>SECURE BY DESIGN</small> <span /></div>
          <p className="terms">By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</p>
          <p className="account-switch">New to Chairside? <Link to="/register">Create an account</Link></p>
        </section>
      </div>
      <footer className="auth-footer"><span>© 2025 Chairside</span><span>Made for the moments between appointments.</span></footer>
    </main>
  )
}
