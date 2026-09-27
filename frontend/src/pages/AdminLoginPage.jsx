import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react'
import Brand from '../components/Brand.jsx'

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [notice, setNotice] = useState('')

  return (
    <main className="admin-login-shell">
      <header className="auth-topbar"><Brand /><Link to="/login" className="quiet-link"><ArrowLeft size={15} /> Back to sign in</Link></header>
      <section className="admin-login-card">
        <div className="admin-login-emblem"><ShieldCheck size={24} /></div>
        <div className="card-kicker">CHAIRSIDE CONTROL ROOM</div>
        <h1>Administrator sign in</h1>
        <p className="card-subtitle">Use your platform credentials to continue.</p>
        <form onSubmit={(event) => { event.preventDefault(); setNotice('Authentication is not connected yet. No credentials were sent and no session was created.') }}>
          <label className="field-label" htmlFor="admin-identifier">Email or username</label>
          <input className="text-input full-input" id="admin-identifier" type="text" autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="you@chairside.com" required />
          <label className="field-label password-label" htmlFor="admin-password">Password</label>
          <input className="text-input full-input" id="admin-password" type="password" autoComplete="current-password" placeholder="Enter your password" required />
          <button className="primary-button" type="submit">Sign in to admin <ArrowRight size={16} /></button>
        </form>
        {notice && <div className="inline-notice" role="status">{notice}</div>}
        <div className="auth-separator"><span /><small>ADMIN ACCESS</small><span /></div>
        <p className="admin-login-foot"><ShieldCheck size={14} /> Protected access for authorized administrators</p>
        <Link className="preview-link" to="/admin">Open dashboard preview <ArrowRight size={14} /></Link>
      </section>
      <footer className="auth-footer"><span>© 2025 Chairside</span><span>Admin authentication will be provided by the backend.</span></footer>
    </main>
  )
}
