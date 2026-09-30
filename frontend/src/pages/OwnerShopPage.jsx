import { useEffect, useState } from 'react'
import { ArrowLeft, Clock3, MapPin, Plus, Scissors, Store, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext.jsx'
import { createShopService, deleteShopService, getOwnerShops, getShopServices } from '../services/shopApi.js'

const defaultShopImage = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'

const initialService = {
  name: '',
  price: '',
  duration_minutes: '30',
}

export default function OwnerShopPage() {
  const { shopId } = useParams()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [shop, setShop] = useState(null)
  const [services, setServices] = useState([])
  const [form, setForm] = useState(initialService)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')

  const loadShopPage = async () => {
    try {
      setLoading(true)
      const [shopResult, serviceResult] = await Promise.all([
        getOwnerShops(),
        getShopServices(shopId),
      ])
      const currentShop = (shopResult.shops || []).find((item) => String(item.id) === String(shopId))

      if (!currentShop) {
        throw new Error('Shop not found.')
      }

      setShop(currentShop)
      setServices(serviceResult.services || [])
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadShopPage()
  }, [shopId])

  const handleAddService = async (event) => {
    event.preventDefault()
    setNotice('')

    try {
      setSaving(true)
      const result = await createShopService(shopId, form)
      setServices((current) => [result.service, ...current])
      setForm(initialService)
      setNotice(result.message)
    } catch (error) {
      setNotice(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteService = async (serviceId) => {
    try {
      const result = await deleteShopService(shopId, serviceId)
      setServices((current) => current.filter((service) => service.id !== serviceId))
      setNotice(result.message)
    } catch (error) {
      setNotice(error.message)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  if (loading) {
    return <main className="owner-shop-loading">Loading shop...</main>
  }

  return (
    <main className="admin-shell owner-shell">
      <aside className="admin-sidebar owner-sidebar">
        <div className="sidebar-top">
          <div className="brand brand-light">
            <span className="brand-mark"><Store size={16} /></span>
            <span>Chairside</span>
          </div>
        </div>
        <div className="sidebar-label">OWNER DASHBOARD</div>
        <nav className="sidebar-nav" aria-label="Owner navigation">
          <button className="sidebar-link sidebar-link-active" type="button" onClick={() => navigate('/owner')}>
            <Store size={17} />
            <span>My shops</span>
          </button>
          <button className="sidebar-link" type="button" onClick={handleLogout}>
            <ArrowLeft size={17} />
            <span>Log out</span>
          </button>
        </nav>
        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="profile-avatar">{(user?.name || 'Owner').slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{user?.name || 'Owner'}</strong>
              <small>Shop owner</small>
            </div>
          </div>
        </div>
      </aside>

      <section className="admin-main owner-main">
        <header className="admin-topbar">
          <button type="button" className="shop-page-back" onClick={() => navigate('/owner')}>
            <ArrowLeft size={15} /> Back to shops
          </button>
          <div className="topbar-right">
            <div className="preview-badge"><span /> SHOP MODE</div>
            <div className="topbar-divider" />
            <div className="topbar-avatar">{(user?.name || 'O').slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        {shop ? (
          <div className="dashboard-content owner-content owner-shop-content">
            <div className="owner-shop-hero">
              <img src={shop.image_url || defaultShopImage} alt={shop.name} />
              <div className="owner-shop-hero-copy">
                <div className="eyebrow dashboard-eyebrow">SHOP MANAGEMENT</div>
                <h1>{shop.name}</h1>
                <p><MapPin size={14} /> {shop.address}</p>
                <div className="owner-shop-hero-meta">
                  <span><Clock3 size={13} /> {shop.opening_time} - {shop.closing_time}</span>
                  <span className={`shop-open-pill ${shop.is_opened ? 'shop-open' : 'shop-closed'}`}>{shop.is_opened ? 'Open' : 'Closed'}</span>
                </div>
              </div>
            </div>

            <section className="service-management-grid">
              <div className="pending-panel service-list-panel">
                <div className="panel-heading">
                  <div>
                    <div className="panel-title-row">
                      <h2>Your services</h2>
                      <span className="pending-count">{services.length} added</span>
                    </div>
                    <p>These services will be available for customers to choose.</p>
                  </div>
                </div>

                {services.length === 0 ? (
                  <div className="empty-state service-empty-state">
                    <div className="empty-icon"><Scissors size={22} /></div>
                    <p>No services added yet.</p>
                  </div>
                ) : (
                  <div className="service-list">
                    {services.map((service) => (
                      <div className="service-row" key={service.id}>
                        <div className="service-row-icon"><Scissors size={15} /></div>
                        <div className="service-row-copy">
                          <strong>{service.name}</strong>
                          <span>{service.duration_minutes} minutes</span>
                        </div>
                        <strong className="service-price">₹{Number(service.price).toFixed(2)}</strong>
                        <button type="button" className="service-delete" aria-label={`Delete ${service.name}`} onClick={() => handleDeleteService(service.id)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <section className="owner-form-card service-form-card">
                <div className="panel-heading owner-panel-heading">
                  <div>
                    <div className="panel-title-row">
                      <h2>Add a service</h2>
                      <span className="pending-count"><Plus size={11} /> New</span>
                    </div>
                    <p>Add a service customers can book in your queue.</p>
                  </div>
                </div>
                <form className="owner-form service-form" onSubmit={handleAddService}>
                  <label className="field-label">Service name</label>
                  <input className="text-input full-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Classic haircut" required />
                  <div className="service-form-fields">
                    <div>
                      <label className="field-label">Price</label>
                      <input className="text-input full-input" type="number" min="0" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="250" required />
                    </div>
                    <div>
                      <label className="field-label">Duration (min)</label>
                      <input className="text-input full-input" type="number" min="1" step="1" value={form.duration_minutes} onChange={(event) => setForm({ ...form, duration_minutes: event.target.value })} required />
                    </div>
                  </div>
                  <button type="submit" className="primary-button owner-submit-btn" disabled={saving}>
                    {saving ? 'Adding...' : 'Add service'}
                    {!saving && <Plus size={16} />}
                  </button>
                  {notice && <div className="inline-notice">{notice}</div>}
                </form>
              </section>
            </section>
          </div>
        ) : (
          <div className="dashboard-content owner-content"><div className="inline-notice">{notice || 'Shop not found.'}</div></div>
        )}
      </section>
    </main>
  )
}
