import { useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowLeft, ArrowRight, ArrowUpRight, BarChart3, Check,
  ChevronDown, Clock3, Home, LogOut, Menu, Scissors, Search,
  ShieldCheck, Store, Users, X,
} from 'lucide-react'
import barberHero from './assets/barber-hero.png'
import './App.css'
import './Home.css'

const roles = [
  { id: 'customer', title: 'Customer', detail: 'Find a chair and skip the wait', icon: Users },
  { id: 'owner', title: 'Shop owner', detail: 'Manage your shop and queue', icon: Store },
  { id: 'admin', title: 'Administrator', detail: 'Platform administration', icon: ShieldCheck },
]

function Brand({ light = false }) {
  return <Link className={`brand ${light ? 'brand-light' : ''}`} to="/login" aria-label="Chairside home">
    <span className="brand-mark"><Scissors size={19} strokeWidth={2.4} /></span>
    <span>chairside<span className="brand-period">.</span></span>
  </Link>
}

const howSteps = [
  { number: '01', title: 'Find a Barber', text: 'Explore barbers around you and find a shop that fits your style.' },
  { number: '02', title: 'Choose Services', text: 'Pick the services you need before you get to the chair.' },
  { number: '03', title: 'Join Queue', text: 'Join the shop queue in a few taps, wherever you are.' },
  { number: '04', title: 'Track Your Turn', text: 'Follow your place in line and arrive when it’s nearly your turn.' },
]

function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)
  return <main className="home-page" id="top">
    <header className="home-header">
      <div className="home-nav-wrap">
        <Link className="trimq-brand" to="/" aria-label="TrimQ home" onClick={closeMenu}><span className="trimq-mark"><Scissors size={19} strokeWidth={2.3} /></span><span>Trim<span>Q</span></span></Link>
        <button className="home-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        <nav className={`home-nav-links ${menuOpen ? 'home-nav-open' : ''}`} aria-label="Main navigation">
          <a href="#top" onClick={closeMenu}>Home</a><Link to="/login" onClick={closeMenu}>Find Shops</Link><a href="#how-it-works" onClick={closeMenu}>How It Works</a><a href="#about" onClick={closeMenu}>About</a>
        </nav>
        <div className="home-nav-actions"><Link className="home-login" to="/login">Login</Link><Link className="home-get-started" to="/login">Get Started <ArrowRight size={15} /></Link></div>
      </div>
    </header>
    <section className="home-hero" aria-labelledby="hero-heading">
      <div className="hero-copy">
        <div className="hero-eyebrow"><span /><span>SMART BARBER QUEUE</span></div>
        <h1 id="hero-heading">Skip the wait.<br />Get your <em>perfect cut.</em></h1>
        <p className="hero-description">Discover nearby barber shops, choose your services, join the queue and track your turn in real time.</p>
        <div className="hero-actions"><Link className="hero-primary" to="/login">Find a Barber <ArrowRight size={17} /></Link><a className="hero-secondary" href="#how-it-works">How It Works <span><ArrowUpRight size={15} /></span></a></div>
        <div className="hero-benefits" aria-label="Benefits"><div><span className="benefit-check"><Check size={12} /></span>Real-time queue tracking</div><div><span className="benefit-check"><Check size={12} /></span>Estimated waiting time</div><div><span className="benefit-check"><Check size={12} /></span>Easy service selection</div></div>
      </div>
      <div className="hero-visual"><img src={barberHero} alt="Barber giving a customer a fresh haircut in a warm, modern barbershop" /><div className="image-caption"><span className="caption-icon"><Clock3 size={16} /></span><span><strong>Your time, well spent.</strong><small>Good cuts. Less waiting.</small></span><span className="caption-mark"><Scissors size={20} /></span></div><div className="image-index"><span>01</span><i /><small>THE TRIMQ EXPERIENCE</small></div></div>
      <div className="hero-side-note"><span>THE ART OF A BETTER WAIT</span><i /></div>
    </section>
    <section className="how-section" id="how-it-works">
      <div className="how-heading"><div><div className="section-eyebrow">A BETTER ROUTINE, IN FOUR STEPS</div><h2>Your next cut, <em>made simple.</em></h2></div><p>From finding your barber to taking your seat, TrimQ keeps the whole visit feeling easy.</p></div>
      <div className="steps-grid">{howSteps.map((step) => <article className="step-card" key={step.number}><span className="step-number">{step.number}</span><span className="step-arrow"><ArrowUpRight size={16} /></span><h3>{step.title}</h3><p>{step.text}</p></article>)}</div>
    </section>
    <footer className="home-footer" id="about"><div className="footer-brand-block"><Link className="trimq-brand" to="/" aria-label="TrimQ home"><span className="trimq-mark"><Scissors size={18} strokeWidth={2.3} /></span><span>Trim<span>Q</span></span></Link><p>Smart barber queue management.</p></div><nav className="footer-links" aria-label="Footer navigation"><Link to="/">Home</Link><Link to="/login">Find Shops</Link><a href="#how-it-works">How It Works</a><Link to="/login">Login</Link></nav><span className="footer-copyright">© 2026 TrimQ</span></footer>
  </main>
}

function AuthPage() {
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

  return <main className="auth-shell">
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
        {!otpStep && <div className="role-list" role="group" aria-label="Choose your role">
          {roles.map(({ id, title, detail, icon: Icon }) => <button type="button" key={id} className={`role-option ${role === id ? 'role-selected' : ''}`} onClick={() => { setRole(id); setNotice('') }} aria-pressed={role === id}>
            <span className="role-icon"><Icon size={19} /></span><span className="role-copy"><strong>{title}</strong><small>{detail}</small></span><span className="radio-dot" />
          </button>)}
        </div>}
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
      </section>
    </div>
    <footer className="auth-footer"><span>© 2025 Chairside</span><span>Made for the moments between appointments.</span></footer>
  </main>
}

function AdminLogin() {
  const [identifier, setIdentifier] = useState('')
  const [notice, setNotice] = useState('')
  return <main className="admin-login-shell">
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
}

const navItems = [
  { id: 'Dashboard', icon: Home }, { id: 'Shops', icon: Store }, { id: 'Customers', icon: Users },
  { id: 'Owners', icon: Scissors }, { id: 'Analytics', icon: BarChart3 },
]
const sampleShops = [
  { name: 'The Modern Man', owner: 'Arjun Mehta', location: 'Indiranagar, Bengaluru', time: '12 min ago', initials: 'MM', color: 'peach' },
  { name: 'Crown & Comb', owner: 'Rahul Nair', location: 'Koramangala, Bengaluru', time: '38 min ago', initials: 'CC', color: 'blue' },
  { name: 'Fade Theory', owner: 'Kabir Shah', location: 'HSR Layout, Bengaluru', time: '1 hr ago', initials: 'FT', color: 'green' },
]

function AdminDashboard() {
  const [active, setActive] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  return <main className="admin-shell">
    {sidebarOpen && <button className="sidebar-scrim" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={20} /></button>}
    <aside className={`admin-sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-top"><Brand light /><button className="mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={18} /></button></div>
      <div className="sidebar-label">WORKSPACE</div>
      <nav className="sidebar-nav" aria-label="Admin navigation">
        {navItems.map(({ id, icon: Icon }) => <button key={id} className={`sidebar-link ${active === id ? 'sidebar-link-active' : ''}`} onClick={() => { setActive(id); setSidebarOpen(false) }}><Icon size={17} /><span>{id}</span>{id === 'Shops' && <span className="nav-count">8</span>}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-help"><div className="help-spark">✳</div><strong>Need a hand?</strong><span>Visit the admin help center.</span><button onClick={() => setActive('Help center')}>Get support <ArrowRight size={13} /></button></div>
        <button className="sidebar-link logout-link" onClick={() => navigate('/admin/login')}><LogOut size={17} /><span>Log out</span></button>
        <div className="admin-profile"><div className="profile-avatar">AD</div><div><strong>Admin preview</strong><small>Administrator</small></div><ChevronDown size={15} /></div>
      </div>
    </aside>
    <section className="admin-main">
      <header className="admin-topbar"><button className="mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div><div className="topbar-right"><span className="preview-badge"><span /> PREVIEW MODE</span><div className="topbar-divider" /><button className="search-button" aria-label="Search"><Search size={18} /></button><div className="topbar-avatar">AD</div></div></header>
      <div className="dashboard-content">
        {active === 'Dashboard' ? <>
          <div className="dashboard-heading"><div><div className="eyebrow dashboard-eyebrow">SUNDAY, SEPTEMBER 27, 2026</div><h1>Good morning, Admin <span className="wave">✳</span></h1><p>Here’s what’s happening across Chairside today.</p></div><button className="date-filter">Last 30 days <ChevronDown size={15} /></button></div>
          <div className="preview-alert"><span className="alert-icon"><Activity size={17} /></span><span><strong>Dashboard preview</strong> — sample figures below are illustrative; no live platform data is connected.</span><button aria-label="Dismiss preview message" onClick={(event) => event.currentTarget.parentElement.remove()}><X size={16} /></button></div>
          <div className="stats-grid">
            <StatCard icon={Store} label="Total shops" value="1,284" change="12.8%" trend="up" note="vs. previous 30 days" color="violet" />
            <StatCard icon={Users} label="Registered customers" value="8,549" change="8.2%" trend="up" note="vs. previous 30 days" color="orange" />
            <StatCard icon={Scissors} label="Active owners" value="972" change="3.1%" trend="up" note="vs. previous 30 days" color="green" />
            <StatCard icon={Clock3} label="Pending approvals" value="08" change="Needs review" trend="neutral" note="shops awaiting your review" color="blue" />
          </div>
          <section className="pending-panel"><div className="panel-heading"><div><div className="panel-title-row"><h2>Pending shop approvals</h2><span className="pending-count">08 pending</span></div><p>Review new shops before they go live on Chairside.</p></div><button className="view-all" onClick={() => setActive('Shops')}>View all shops <ArrowRight size={15} /></button></div>
            <div className="shop-table-wrap"><table className="shop-table"><thead><tr><th>SHOP</th><th>OWNER</th><th>LOCATION</th><th>SUBMITTED</th><th>STATUS</th><th /></tr></thead><tbody>{sampleShops.map((shop) => <tr key={shop.name}><td><div className="shop-name-cell"><span className={`shop-avatar ${shop.color}`}>{shop.initials}</span><strong>{shop.name}</strong></div></td><td>{shop.owner}</td><td>{shop.location}</td><td className="submitted-time">{shop.time}</td><td><span className="status-pill"><span /> Pending review</span></td><td><button className="row-more" aria-label={`More options for ${shop.name}`}>···</button></td></tr>)}</tbody></table></div>
            <div className="panel-footer"><span>Showing <strong>3</strong> of <strong>8</strong> pending applications</span><button onClick={() => setActive('Shops')}>Review applications <ArrowRight size={14} /></button></div>
          </section>
          <div className="dashboard-footnote"><ShieldCheck size={14} /> Preview controls do not approve shops or modify platform records.</div>
        </> : <section className="section-placeholder"><div className="placeholder-icon">{(() => { const Icon = navItems.find((item) => item.id === active)?.icon || Activity; return <Icon size={23} /> })()}</div><div className="card-kicker">ADMIN WORKSPACE</div><h1>{active}</h1><p>This section is part of the admin navigation preview. Live records and management actions will be available after backend integration.</p><button className="primary-button placeholder-back" onClick={() => setActive('Dashboard')}><ArrowLeft size={15} /> Back to dashboard</button></section>}
      </div>
    </section>
  </main>
}

function StatCard({ icon: Icon, label, value, change, trend, note, color }) {
  return <article className="stat-card"><div className="stat-top"><span className={`stat-icon stat-${color}`}><Icon size={18} /></span><button className="stat-more" aria-label={`${label} details`}>···</button></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-change">{trend === 'up' ? <span className="trend-up"><ArrowUpRight size={13} /> {change}</span> : <span className="trend-neutral">{change}</span>}<span>{note}</span></div></article>
}

function NotFound() {
  return <main className="not-found"><Brand /><h1>That page isn’t here.</h1><p>Head back to sign in to get started.</p><Link className="primary-button" to="/login">Back to sign in <ArrowRight size={16} /></Link></main>
}

export default function App() {
  return <BrowserRouter><Routes><Route path="/" element={<HomePage />} /><Route path="/login" element={<AuthPage />} /><Route path="/admin/login" element={<AdminLogin />} /><Route path="/admin" element={<AdminDashboard />} /><Route path="*" element={<NotFound />} /></Routes></BrowserRouter>
}
