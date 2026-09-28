import { useState } from 'react'

import { Link } from 'react-router-dom'

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Menu,
  Scissors,
  X,
} from 'lucide-react'

import barberHero from '../assets/barber-hero.png'

import { useAuth } from '../context/AuthContext.jsx'

import '../Home.css'

const howSteps = [
  {
    number: '01',
    title: 'Find a Barber',
    text: 'Explore barbers around you and find a shop that fits your style.',
  },
  {
    number: '02',
    title: 'Choose Services',
    text: 'Pick the services you need before you get to the chair.',
  },
  {
    number: '03',
    title: 'Join Queue',
    text: 'Join the shop queue in a few taps, wherever you are.',
  },
  {
    number: '04',
    title: 'Track Your Turn',
    text: 'Follow your place in line and arrive when it’s nearly your turn.',
  },
]

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false)

  const { user, isAuthenticated, loading, logout } = useAuth()

  const closeMenu = () => setMenuOpen(false)

  async function handleLogout() {
    await logout()
    closeMenu()
  }

  return (
    <main className="home-page" id="top">
      <header className="home-header">
        <div className="home-nav-wrap">
          <Link
            className="trimq-brand"
            to="/"
            aria-label="TrimQ home"
            onClick={closeMenu}
          >
            <span className="trimq-mark">
              <Scissors size={19} strokeWidth={2.3} />
            </span>

            <span>
              Trim<span>Q</span>
            </span>
          </Link>

          <button
            className="home-menu-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <nav
            className={`home-nav-links ${
              menuOpen ? 'home-nav-open' : ''
            }`}
            aria-label="Main navigation"
          >
            <a href="#top" onClick={closeMenu}>
              Home
            </a>

            <Link to="/login" onClick={closeMenu}>
              Find Shops
            </Link>

            <a href="#how-it-works" onClick={closeMenu}>
              How It Works
            </a>

            <a href="#about" onClick={closeMenu}>
              About
            </a>
          </nav>

          <div className="home-nav-actions">
            {!loading && isAuthenticated ? (
              <>
                <span className="home-login">
                  Hi, {user?.name || 'User'}
                </span>

                <button
                  className="home-get-started"
                  type="button"
                  onClick={handleLogout}
                >
                  Logout
                  <ArrowRight size={15} />
                </button>
              </>
            ) : (
              <>
                <Link
                  className="home-login"
                  to="/login"
                >
                  Login
                </Link>

                <Link
                  className="home-get-started"
                  to="/login"
                >
                  Get Started
                  <ArrowRight size={15} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section
        className="home-hero"
        aria-labelledby="hero-heading"
      >
        <div className="hero-copy">
          <div className="hero-eyebrow">
            <span />
            <span>SMART BARBER QUEUE</span>
          </div>

          <h1 id="hero-heading">
            Skip the wait.
            <br />
            Get your <em>perfect cut.</em>
          </h1>

          <p className="hero-description">
            Discover nearby barber shops, choose your services,
            join the queue and track your turn in real time.
          </p>

          <div className="hero-actions">
            <Link
              className="hero-primary"
              to="/login"
            >
              Find a Barber
              <ArrowRight size={17} />
            </Link>

            <a
              className="hero-secondary"
              href="#how-it-works"
            >
              How It Works
              <span>
                <ArrowUpRight size={15} />
              </span>
            </a>
          </div>

          <div
            className="hero-benefits"
            aria-label="Benefits"
          >
            <div>
              <span className="benefit-check">
                <Check size={12} />
              </span>
              Real-time queue tracking
            </div>

            <div>
              <span className="benefit-check">
                <Check size={12} />
              </span>
              Estimated waiting time
            </div>

            <div>
              <span className="benefit-check">
                <Check size={12} />
              </span>
              Easy service selection
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <img
            src={barberHero}
            alt="Barber giving a customer a fresh haircut in a warm, modern barbershop"
          />

          <div className="image-caption">
            <span className="caption-icon">
              <Clock3 size={16} />
            </span>

            <span>
              <strong>Your time, well spent.</strong>
              <small>Good cuts. Less waiting.</small>
            </span>

            <span className="caption-mark">
              <Scissors size={20} />
            </span>
          </div>

          <div className="image-index">
            <span>01</span>
            <i />
            <small>THE TRIMQ EXPERIENCE</small>
          </div>
        </div>

        <div className="hero-side-note">
          <span>THE ART OF A BETTER WAIT</span>
          <i />
        </div>
      </section>

      <section
        className="how-section"
        id="how-it-works"
      >
        <div className="how-heading">
          <div>
            <div className="section-eyebrow">
              A BETTER ROUTINE, IN FOUR STEPS
            </div>

            <h2>
              Your next cut, <em>made simple.</em>
            </h2>
          </div>

          <p>
            From finding your barber to taking your seat,
            TrimQ keeps the whole visit feeling easy.
          </p>
        </div>

        <div className="steps-grid">
          {howSteps.map((step) => (
            <article
              className="step-card"
              key={step.number}
            >
              <span className="step-number">
                {step.number}
              </span>

              <span className="step-arrow">
                <ArrowUpRight size={16} />
              </span>

              <h3>{step.title}</h3>

              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer
        className="home-footer"
        id="about"
      >
        <div className="footer-brand-block">
          <Link
            className="trimq-brand"
            to="/"
            aria-label="TrimQ home"
          >
            <span className="trimq-mark">
              <Scissors
                size={18}
                strokeWidth={2.3}
              />
            </span>

            <span>
              Trim<span>Q</span>
            </span>
          </Link>

          <p>Smart barber queue management.</p>
        </div>

        <nav
          className="footer-links"
          aria-label="Footer navigation"
        >
          <Link to="/">Home</Link>

          <Link to="/login">Find Shops</Link>

          <a href="#how-it-works">
            How It Works
          </a>

          <Link to="/login">Login</Link>
        </nav>

        <span className="footer-copyright">
          © 2026 TrimQ
        </span>
      </footer>
    </main>
  )
}