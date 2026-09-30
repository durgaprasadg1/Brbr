import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, Clock3, Image as ImageIcon, MapPin, Pencil, Plus, Store, Trash2, X } from 'lucide-react'

import { useAuth } from '../context/AuthContext.jsx'
import { createShop, deleteShop, getOwnerShops, updateShop } from '../services/shopApi.js'

const defaultShopImage = 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80'

const initialForm = {
  name: '',
  description: '',
  address: '',
  latitude: '',
  longitude: '',
  contact_number: '',
  opening_time: '09:00',
  closing_time: '20:00',
  image_url: '',
}

export default function OwnerDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedShop, setSelectedShop] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editingShopId, setEditingShopId] = useState(null)

  const resetForm = () => {
    setForm(initialForm)
    setIsEditing(false)
    setEditingShopId(null)
  }

  const loadShops = async () => {
    try {
      const result = await getOwnerShops()
      const nextShops = (result.shops || []).map((shop) => ({
        ...shop,
        image_url: shop.image_url || defaultShopImage,
        is_opened: Boolean(shop.is_opened),
      }))
      setShops(nextShops)
    } catch (error) {
      setNotice(error.message)
    }
  }

  useEffect(() => {
    loadShops()
  }, [])

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setNotice('')

    if (!form.image_url) {
      setNotice('Please upload a shop image before submitting.')
      return
    }

    try {
      setLoading(true)
      const shopPayload = {
        name: form.name,
        description: form.description,
        address: form.address,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        contact_number: form.contact_number,
        opening_time: form.opening_time,
        closing_time: form.closing_time,
        image_url: form.image_url,
      }

      const result = isEditing && editingShopId
        ? await updateShop(editingShopId, shopPayload)
        : await createShop(shopPayload)

      setNotice(result.message)
      resetForm()
      setShowAddForm(false)
      await loadShops()
    } catch (error) {
      setNotice(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice('Please upload an image smaller than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      handleChange('image_url', String(reader.result))
    }
    reader.onerror = () => {
      setNotice('Unable to read the selected image.')
    }
    reader.readAsDataURL(file)
  }

  const handleEditClick = (shop, event) => {
    event.stopPropagation()
    setForm({
      name: shop.name || '',
      description: shop.description || '',
      address: shop.address || '',
      latitude: shop.latitude ?? '',
      longitude: shop.longitude ?? '',
      contact_number: shop.contact_number || '',
      opening_time: shop.opening_time || '09:00',
      closing_time: shop.closing_time || '20:00',
      image_url: shop.image_url || '',
    })
    setIsEditing(true)
    setEditingShopId(shop.id)
    setShowAddForm(true)
  }

  const handleDeleteClick = async (shopId, event) => {
    event.stopPropagation()

    if (!window.confirm('Delete this shop? This action cannot be undone.')) {
      return
    }

    try {
      const result = await deleteShop(shopId)
      setNotice(result.message)
      if (selectedShop?.id === shopId) {
        setSelectedShop(null)
      }
      resetForm()
      await loadShops()
    } catch (error) {
      setNotice(error.message)
    }
  }

  const handleToggleOpen = (shopId) => {
    const targetShop = shops.find((shop) => shop.id === shopId)

    if (!targetShop || targetShop.status !== 'ACTIVE') {
      return
    }

    const nextOpenState = !targetShop.is_opened

    updateShop(shopId, { is_opened: nextOpenState })
      .then((result) => {
        setShops((current) =>
          current.map((shop) => (shop.id === shopId ? { ...shop, is_opened: nextOpenState } : shop))
        )

        setSelectedShop((current) => {
          if (!current || current.id !== shopId) return current
          return {
            ...current,
            is_opened: nextOpenState,
          }
        })

        setNotice(result.message || 'Shop status updated.')
      })
      .catch((error) => {
        setNotice(error.message)
      })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/users/login', { replace: true })
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
          <button className="sidebar-link sidebar-link-active" type="button">
            <Building2 size={17} />
            <span>My shops</span>
          </button>

          <button className="sidebar-link" type="button" onClick={handleLogout}>
            <ArrowRight size={17} />
            <span>Log out</span>
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-spark">✳</div>
            <strong>Shop registration</strong>
            <span>Add your shop and wait for admin approval.</span>
          </div>

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
          <div className="breadcrumb">
            Dashboard <span>/</span> <strong>Shop management</strong>
          </div>

          <div className="topbar-right">
            <div className="preview-badge"><span /> OWNER MODE</div>
            <div className="topbar-divider" />
            <div className="topbar-avatar">{(user?.name || 'O').slice(0, 1).toUpperCase()}</div>
          </div>
        </header>

        <div className="dashboard-content owner-content">
          <div className="dashboard-heading">
            <div>
              <div className="eyebrow dashboard-eyebrow">WELCOME BACK</div>
              <h1>Manage your shop <span className="wave">✳</span></h1>
              <p>Track your listings and submit new shop requests to the admin team.</p>
            </div>
          </div>

          <div className="owner-actions-bar">
            <button
              type="button"
              className="primary-button owner-add-button"
              onClick={() => setShowAddForm((value) => !value)}
            >
              <Plus size={16} />
              {showAddForm ? 'Close form' : 'Add shop'}
            </button>
          </div>

          {showAddForm && (
            <section className="owner-form-card">
              <div className="panel-heading owner-panel-heading">
                <div>
                  <div className="panel-title-row">
                    <h2>{isEditing ? 'Update shop' : 'Add a new shop'}</h2>
                    <span className="pending-count">{isEditing ? 'Editing' : 'Approval pending'}</span>
                  </div>
                  <p>{isEditing ? 'Update your shop information below.' : 'Submit your shop details below. Admin review will be required before it goes live.'}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="owner-form">
                <div className="owner-grid">
                  <div className="owner-span-2">
                    <label className="field-label">Shop image</label>
                    <div className="image-upload-box">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="file-input" />
                      <div className="image-upload-preview">
                        {form.image_url ? (
                          <img src={form.image_url} alt="Shop preview" className="upload-preview-image" />
                        ) : (
                          <div className="upload-placeholder">
                            <ImageIcon size={28} />
                            <span>Upload a shop photo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Shop name</label>
                    <input className="text-input full-input" value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="The Modern Man" required />
                  </div>

                  <div>
                    <label className="field-label">Contact number</label>
                    <input className="text-input full-input" value={form.contact_number} onChange={(e) => handleChange('contact_number', e.target.value)} placeholder="+91 98765 43210" required />
                  </div>

                  <div className="owner-span-2">
                    <label className="field-label">Address</label>
                    <input className="text-input full-input" value={form.address} onChange={(e) => handleChange('address', e.target.value)} placeholder="12, MG Road, Bengaluru" required />
                  </div>

                  <div>
                    <label className="field-label">Latitude</label>
                    <input className="text-input full-input" type="number" step="any" value={form.latitude} onChange={(e) => handleChange('latitude', e.target.value)} placeholder="12.9716" required />
                  </div>

                  <div>
                    <label className="field-label">Longitude</label>
                    <input className="text-input full-input" type="number" step="any" value={form.longitude} onChange={(e) => handleChange('longitude', e.target.value)} placeholder="77.5946" required />
                  </div>

                  <div>
                    <label className="field-label">Opening time</label>
                    <input className="text-input full-input" type="time" value={form.opening_time} onChange={(e) => handleChange('opening_time', e.target.value)} required />
                  </div>

                  <div>
                    <label className="field-label">Closing time</label>
                    <input className="text-input full-input" type="time" value={form.closing_time} onChange={(e) => handleChange('closing_time', e.target.value)} required />
                  </div>

                  <div className="owner-span-2">
                    <label className="field-label">Description</label>
                    <textarea className="text-input full-input owner-textarea" value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Premium grooming, beard trims, and modern styling services." rows={4} />
                  </div>
                </div>

                <button type="submit" className="primary-button owner-submit-btn" disabled={loading}>
                  {loading ? (isEditing ? 'Saving...' : 'Submitting...') : (isEditing ? 'Save changes' : 'Submit shop request')}
                  {!loading && <Plus size={16} />}
                </button>

                {isEditing && (
                  <button
                    type="button"
                    className="secondary-button secondary-button-spacing"
                    onClick={() => {
                      resetForm()
                      setShowAddForm(false)
                    }}
                  >
                    Cancel edit
                  </button>
                )}
              </form>

              {notice && <div className="inline-notice">{notice}</div>}
            </section>
          )}

          <section className="pending-panel">
            <div className="panel-heading">
              <div>
                <div className="panel-title-row">
                  <h2>My submitted shops</h2>
                  <span className="pending-count">{shops.length} total</span>
                </div>
                <p>Every shop you add appears here with its current approval state.</p>
              </div>
            </div>

            {shops.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Store size={22} /></div>
                <p>No shop has been added yet.</p>
              </div>
            ) : (
              <div className="shop-card-grid">
                {shops.map((shop) => {
                  const isApproved = shop.status === 'ACTIVE'
                  const isOpen = Boolean(shop.is_opened)

                  return (
                    <article
                      key={shop.id}
                      className="shop-card"
                      onClick={() => navigate(`/owner/shops/${shop.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          navigate(`/owner/shops/${shop.id}`)
                        }
                      }}
                      tabIndex={0}
                      role="button"
                    >
                      <div className="shop-card-image-wrap">
                        <img src={shop.image_url || defaultShopImage} alt={shop.name} className="shop-card-image" />
                        <span className={`shop-status-badge ${isApproved ? 'shop-status-approved' : 'shop-status-pending'}`}>
                          {isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </div>

                      <div className="shop-card-body">
                        <div className="shop-card-header-row">
                          <div>
                            <h3>{shop.name}</h3>
                            <p>{shop.address}</p>
                          </div>
                          <span className={`shop-open-pill ${isApproved ? (isOpen ? 'shop-open' : 'shop-closed') : 'shop-inactive'}`}>
                            {isApproved ? (isOpen ? 'Open' : 'Closed') : 'Waiting'}
                          </span>
                        </div>

                        <div className="shop-card-meta">
                          <span><Clock3 size={12} /> {shop.opening_time} - {shop.closing_time}</span>
                          <span><MapPin size={12} /> {shop.address}</span>
                        </div>

                        <div className="shop-card-footer owner-card-actions">
                          <button
                            type="button"
                            className="shop-card-action shop-card-action-edit"
                            onClick={(event) => handleEditClick(shop, event)}
                          >
                            <Pencil size={12} />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="shop-card-action shop-card-action-delete"
                            onClick={(event) => handleDeleteClick(shop.id, event)}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>

                          <button type="button" className="shop-card-action" onClick={(event) => {
                            event.stopPropagation()
                            setSelectedShop(shop)
                          }}>
                            View details
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </section>

      {selectedShop && (
        <div className="shop-details-overlay" onClick={() => setSelectedShop(null)}>
          <div className="shop-details-modal" onClick={(event) => event.stopPropagation()}>
            <button className="shop-details-close" type="button" onClick={() => setSelectedShop(null)}>
              <X size={18} />
            </button>

            <div className="shop-detail-image-wrap">
              <img src={selectedShop.image_url || defaultShopImage} alt={selectedShop.name} className="shop-detail-image" />
            </div>

            <div className="shop-detail-body">
              <div className="shop-detail-top">
                <div>
                  <div className="card-kicker">SHOP PROFILE</div>
                  <h2>{selectedShop.name}</h2>
                </div>

                <span className={`shop-open-pill ${selectedShop.status === 'ACTIVE' ? (selectedShop.is_opened ? 'shop-open' : 'shop-closed') : 'shop-inactive'}`}>
                  {selectedShop.status === 'ACTIVE' ? (selectedShop.is_opened ? 'Open now' : 'Closed now') : 'Pending approval'}
                </span>
              </div>

              <p className="shop-detail-address">{selectedShop.address}</p>

              <div className="shop-detail-grid">
                <div>
                  <strong>Hours</strong>
                  <span>{selectedShop.opening_time} - {selectedShop.closing_time}</span>
                </div>
                <div>
                  <strong>Contact</strong>
                  <span>{selectedShop.contact_number || 'Not provided'}</span>
                </div>
              </div>

              <div className="shop-description-box">
                <strong>About this shop</strong>
                <p>{selectedShop.description || 'No description provided yet.'}</p>
              </div>

              {selectedShop.status === 'ACTIVE' && (
                <button
                  type="button"
                  className={`primary-button shop-toggle-button ${selectedShop.is_opened ? 'shop-toggle-close' : ''}`}
                  onClick={() => handleToggleOpen(selectedShop.id)}
                >
                  {selectedShop.is_opened ? 'Mark shop as closed' : 'Mark shop as open'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
