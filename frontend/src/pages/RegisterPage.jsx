import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, ChevronDown } from 'lucide-react'
import Brand from '../components/Brand.jsx'
import RoleSelector from '../components/auth/RoleSelector.jsx'

export default function RegisterPage() {
  const [role, setRole] = useState('customer')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [notice, setNotice] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setNotice('Registration is a frontend preview. Account creation and OTP verification are not connected.')
  }

  return (
    <main className="auth-shell">
      <header className="auth-topbar">
        <Brand />
        <div className="register-login-link"><span>Already have an account?</span><Link to="/login" className="quiet-link">Log in <ArrowRight size={15} /></Link></div>
      </header>
      <div className="auth-content">
        <section className="auth-intro">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT GREAT CUT STARTS HERE</div>
          <h1>A better barber<br /><span>visit starts here.</span></h1>
          <p>Create your Chairside account to find your place in line, choose services and make more of your time.</p>
          <div className="intro-note"><div className="note-icon"><Clock3 size={18} /></div><span><strong>Your time, in good hands.</strong><br />A better way to get to the barber.</span></div>
          <div className="intro-decoration"><span>01</span><div /><span>02</span><div /><span>03</span></div>
        </section>
        <section className="auth-card register-card" aria-labelledby="register-title">
          <div className="card-kicker">JOIN CHAIRSIDE</div>
          <h2 id="register-title">Create your account.</h2>
          <p className="card-subtitle">Choose your account type and add your details to get started.</p>
          <RoleSelector
            selectedRole={role}
            onSelect={(nextRole) => { setRole(nextRole); setNotice('') }}
            disabledRoles={['admin']}
            disabledRoleDetails={{ admin: 'Admin accounts are managed separately' }}
          />
          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="register-name">Full name</label>
            <input id="register-name" className="text-input full-input" type="text" autoComplete="name" placeholder="Enter your full name" value={name} onChange={(event) => setName(event.target.value)} required />
            <label className="field-label register-phone-label" htmlFor="register-mobile">Mobile number</label>
            <div className="phone-field"><span className="country-code"><span aria-hidden="true">🇮🇳</span><span>+91</span><ChevronDown size={13} /></span><input id="register-mobile" value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))} className="text-input" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="98765 43210" maxLength={10} required /></div>
            <button className="primary-button" type="submit">Continue with phone <ArrowRight size={16} /></button>
          </form>
          {notice && <div className="inline-notice" role="status">{notice}</div>}
          <div className="auth-separator"><span /><small>SECURE BY DESIGN</small><span /></div>
          <p className="terms">By continuing, you agree to our <a href="#terms">Terms</a> and <a href="#privacy">Privacy Policy</a>.</p>
          <p className="account-switch">Already have an account? <Link to="/login">Log in</Link></p>
        </section>
      </div>
      <footer className="auth-footer"><span>© 2025 Chairside</span><span>Account creation will be completed when authentication is connected.</span></footer>
    </main>
  )
}
