import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowLeft, ArrowRight, BarChart3, ChevronDown, Clock3, Home, MapPin, Scissors, ShieldCheck, Store, Users, X } from 'lucide-react'
import AdminSidebar from '../components/admin/AdminSidebar.jsx'
import AdminTopbar from '../components/admin/AdminTopbar.jsx'
import StatCard from '../components/admin/StatCard.jsx'
import { getAdminShopStats, getPendingShopRequests, reviewShopRequest } from '../services/shopApi.js'

const adminNavItems = [
  { id: 'Dashboard', icon: Home },
  { id: 'Shops', icon: Store },
  { id: 'Customers', icon: Users },
  { id: 'Owners', icon: Scissors },
  { id: 'Analytics', icon: BarChart3 },
]

const emptyStats = {
  total_shops: 0,
  registered_customers: 0,
  active_owners: 0,
  pending_approvals: 0,
}

const DashboardOverview = ({ pendingShops, stats, onRefresh, onReview }) => {
  const [showPreviewNotice, setShowPreviewNotice] = useState(true)
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!pendingShops.length) {
      setNotice('No pending shop submissions right now.')
      return
    }

    setNotice('')
  }, [pendingShops])

  const statCards = [
    { icon: Store, label: 'Total shops', value: stats.total_shops, color: 'violet' },
    { icon: Users, label: 'Registered customers', value: stats.registered_customers, color: 'orange' },
    { icon: Scissors, label: 'Active owners', value: stats.active_owners, color: 'green' },
    { icon: Clock3, label: 'Pending approvals', value: stats.pending_approvals, color: 'blue' },
  ].map((stat) => ({
    ...stat,
    value: stat.value.toLocaleString('en-IN'),
    change: 'Live',
    trend: 'neutral',
    note: 'from current database records',
  }))

  const handleReview = async (shopId, action) => {
    try {
      let rejectionReason = ''

      if (action === 'REJECTED') {
        rejectionReason = window.prompt('Reason for rejection:') || ''
        if (!rejectionReason.trim()) {
          return
        }
      }

      const result = await onReview(shopId, action, rejectionReason)
      setNotice(result.message)
      await onRefresh()
    } catch (error) {
      setNotice(error.message)
    }
  }

  return <>
    <div className="dashboard-heading">
      <div><div className="eyebrow dashboard-eyebrow">ADMIN CONTROL ROOM</div><h1>Good morning, Admin <span className="wave">✳</span></h1><p>Here’s what’s happening across Chairside today.</p></div>
      <button className="date-filter">Last 30 days <ChevronDown size={15} /></button>
    </div>

    {showPreviewNotice && <div className="preview-alert"><span className="alert-icon"><Activity size={17} /></span><span><strong>Live request board</strong> — shop submissions are pulled from the backend and can be approved or rejected here.</span><button aria-label="Dismiss preview message" onClick={() => setShowPreviewNotice(false)}><X size={16} /></button></div>}

    <div className="stats-grid">{statCards.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>

    <section className="pending-panel">
      <div className="panel-heading">
        <div><div className="panel-title-row"><h2>Pending shop approvals</h2><span className="pending-count">{pendingShops.length} pending</span></div><p>Review new shops before they go live on Chairside.</p></div>
      </div>

      {notice && <div className="inline-notice admin-inline-notice">{notice}</div>}

      {pendingShops.length === 0 ? (
        <div className="empty-state admin-empty-state">
          <div className="empty-icon"><Store size={22} /></div>
          <p>No new shop requests are waiting for review.</p>
        </div>
      ) : (
        <div className="shop-table-wrap">
          <table className="shop-table">
            <thead>
              <tr>
                <th>SHOP</th>
                <th>OWNER</th>
                <th>LOCATION</th>
                <th>SUBMITTED</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {pendingShops.map((shop) => (
                <tr key={shop.id}>
                  <td>
                    <div className="shop-name-cell">
                      <span className="shop-avatar green">{shop.name.slice(0, 2).toUpperCase()}</span>
                      <strong>{shop.name}</strong>
                    </div>
                  </td>
                  <td>
                    <div className="shop-owner-info">
                      <strong>{shop.owner_name}</strong>
                      <small>{shop.owner_email}</small>
                    </div>
                  </td>
                  <td>
                    <div className="shop-meta-row"><MapPin size={12} /> {shop.address}</div>
                  </td>
                  <td className="submitted-time">{new Date(shop.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><span className="status-pill"><span /> Pending review</span></td>
                  <td>
                    <div className="admin-action-group">
                      <button type="button" className="approve-btn" onClick={() => handleReview(shop.id, 'ACTIVE')}>Approve</button>
                      <button type="button" className="reject-btn" onClick={() => handleReview(shop.id, 'REJECTED')}>Reject</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>

    <div className="dashboard-footnote"><ShieldCheck size={14} /> Approvals update the shop status in the database and are visible to the owner immediately.</div>
  </>
}

const AdminSectionPlaceholder = ({ active, onBack }) => {
  const Icon = adminNavItems.find((item) => item.id === active)?.icon || Activity

  return <section className="section-placeholder">
    <div className="placeholder-icon"><Icon size={23} /></div>
    <div className="card-kicker">ADMIN WORKSPACE</div>
    <h1>{active}</h1>
    <p>This section is part of the admin navigation area. Shop requests are managed from the main dashboard.</p>
    <button className="primary-button placeholder-back" onClick={onBack}><ArrowLeft size={15} /> Back to dashboard</button>
  </section>
}

export default function AdminDashboardPage() {
  const [active, setActive] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingShops, setPendingShops] = useState([])
  const [stats, setStats] = useState(emptyStats)
  const navigate = useNavigate()

  const fetchPendingShops = async () => {
    try {
      const result = await getPendingShopRequests()
      setPendingShops(result.shops || [])
    } catch (error) {
      setPendingShops([])
    }
  }

  const fetchAdminStats = async () => {
    try {
      const result = await getAdminShopStats()
      setStats({ ...emptyStats, ...(result.stats || {}) })
    } catch (error) {
      setStats(emptyStats)
    }
  }

  useEffect(() => {
    fetchPendingShops()
    fetchAdminStats()
  }, [])

  const navigateSection = (section) => {
    setActive(section)
    setSidebarOpen(false)
  }

  const handleReview = async (shopId, action, rejectionReason = '') => {
    const result = await reviewShopRequest(shopId, action, rejectionReason)
    return result
  }

  return (
    <main className="admin-shell">
      <AdminSidebar items={adminNavItems} active={active} onNavigate={navigateSection} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={() => navigate('/admin/login')} />
      <section className="admin-main">
        <AdminTopbar active={active} onMenuOpen={() => setSidebarOpen(true)} />
        <div className="dashboard-content">
          {active === 'Dashboard'
            ? <DashboardOverview pendingShops={pendingShops} stats={stats} onRefresh={async () => { await fetchPendingShops(); await fetchAdminStats() }} onReview={handleReview} />
            : <AdminSectionPlaceholder active={active} onBack={() => setActive('Dashboard')} />}
        </div>
      </section>
    </main>
  )
}
