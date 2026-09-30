import { useEffect, useState } from 'react'
import { ArrowLeft, Clock3, MapPin, Scissors, Star } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { getPublicShopDetails } from '../services/shopApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import '../Home.css'

const defaultShopImage = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'

export default function CustomerShopPage() {
  const { shopId } = useParams()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [shop, setShop] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getPublicShopDetails(shopId)
      .then((result) => {
        setShop(result.shop)
        setServices(result.services || [])
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [shopId])

  if (loading) {
    return <main className="customer-shop-page"><div className="shops-empty">Loading shop details...</div></main>
  }

  if (error || !shop) {
    return (
      <main className="customer-shop-page">
        <div className="shops-empty">{error || 'This shop is not available.'}<Link className="customer-shop-back" to="/#shops">Back to shops</Link></div>
      </main>
    )
  }

  return (
    <main className="customer-shop-page">
      <header className="customer-shop-header">
        <Link className="customer-shop-back" to="/#shops"><ArrowLeft size={15} /> Back to shops</Link>
        <Link className="trimq-brand" to="/">
          <span className="trimq-mark"><Scissors size={18} strokeWidth={2.3} /></span>
          <span>Trim<span>Q</span></span>
        </Link>
        {authLoading ? (
          <span className="customer-shop-login">Checking session...</span>
        ) : isAuthenticated ? (
          <span className="customer-shop-login">Hi, {user?.name || 'Customer'}</span>
        ) : (
          <Link className="customer-shop-login" to="/login">Login to join queue <ArrowLeft size={14} /></Link>
        )}
      </header>

      <section className="customer-shop-hero">
        <img src={shop.image_url || defaultShopImage} alt={shop.name} />
        <div className="customer-shop-hero-copy">
          <div className="section-eyebrow">SHOP PROFILE</div>
          <div className="customer-shop-title-row">
            <h1>{shop.name}</h1>
            <span className={`public-shop-status ${shop.is_opened ? 'public-shop-open' : 'public-shop-closed'}`}>
              {shop.is_opened ? 'Open now' : 'Closed'}
            </span>
          </div>
          <p className="customer-shop-address"><MapPin size={15} /> {shop.address}</p>
          <div className="customer-shop-facts">
            <span><Clock3 size={14} /> {shop.opening_time} - {shop.closing_time}</span>
            <span><Star size={14} /> {Number(shop.average_rating || 0).toFixed(1)} rating</span>
          </div>
          <p className="customer-shop-description">{shop.description || 'Quality grooming services, made easy.'}</p>
        </div>
      </section>

      <section className="customer-services-section">
        <div className="section-eyebrow">WHAT WE OFFER</div>
        <h2>Choose your <em>service.</em></h2>
        {services.length === 0 ? (
          <div className="shops-empty">This shop has not added services yet.</div>
        ) : (
          <div className="customer-service-grid">
            {services.map((service) => (
              <article className="customer-service-card" key={service.id}>
                <div className="customer-service-icon"><Scissors size={18} /></div>
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.duration_minutes} minutes</p>
                </div>
                <strong>₹{Number(service.price).toFixed(2)}</strong>
              </article>
            ))}
          </div>
        )}
        <Link className="hero-primary customer-queue-button" to={isAuthenticated ? `/shops/${shopId}` : '/login'}>
          {isAuthenticated ? 'Join the queue' : 'Login to join the queue'}
          <ArrowLeft size={16} />
        </Link>
      </section>
    </main>
  )
}
