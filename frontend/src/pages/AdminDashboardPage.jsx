import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowLeft, BarChart3, ChevronDown, Clock3, Home, MapPin, Scissors, ShieldCheck, Store, Users, X } from 'lucide-react'
import AdminSidebar from '../components/admin/AdminSidebar.jsx'
import AdminTopbar from '../components/admin/AdminTopbar.jsx'
import StatCard from '../components/admin/StatCard.jsx'
import { getAdminShopStats, getAdminShops, getPendingShopRequests, reviewShopRequest } from '../services/shopApi.js'
import { getAdminUsers } from '../services/api.js'

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

      {(notice || (!pendingShops.length && 'No pending shop submissions right now.')) && <div className="inline-notice admin-inline-notice">{notice || 'No pending shop submissions right now.'}</div>}

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

const AdminShopsSection = () => {
  const [shops, setShops] = useState([])
  const [tab, setTab] = useState('verified')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminShops().then((result) => setShops(result.shops || [])).catch(() => setShops([])).finally(() => setLoading(false))
  }, [])

  const visibleShops = shops.filter((shop) => tab === 'verified' ? shop.status === 'ACTIVE' : shop.status !== 'ACTIVE')

  return <section className="admin-data-section">
    <div className="section-heading"><div><div className="eyebrow dashboard-eyebrow">SHOP DIRECTORY</div><h1>Shops</h1><p>Manage verified shops and review shops that are not live yet.</p></div></div>
    <div className="data-tabs"><button className={tab === 'verified' ? 'data-tab-active' : ''} onClick={() => setTab('verified')}>Verified shops <span>{shops.filter((shop) => shop.status === 'ACTIVE').length}</span></button><button className={tab === 'unverified' ? 'data-tab-active' : ''} onClick={() => setTab('unverified')}>Unverified shops <span>{shops.filter((shop) => shop.status !== 'ACTIVE').length}</span></button></div>
    <div className="data-panel">{loading ? <div className="data-state">Loading shops...</div> : visibleShops.length === 0 ? <div className="data-state">No {tab} shops found.</div> : <div className="shop-table-wrap"><table className="shop-table"><thead><tr><th>SHOP</th><th>OWNER</th><th>LOCATION</th><th>CREATED</th><th>STATUS</th></tr></thead><tbody>{visibleShops.map((shop) => <tr key={shop.id}><td><div className="shop-name-cell"><span className="shop-avatar green">{shop.name.slice(0, 2).toUpperCase()}</span><strong>{shop.name}</strong></div></td><td><div className="shop-owner-info"><strong>{shop.owner_name}</strong><small>{shop.owner_email}</small></div></td><td><div className="shop-meta-row"><MapPin size={12} /> {shop.address}</div></td><td className="submitted-time">{new Date(shop.created_at).toLocaleDateString('en-IN')}</td><td><span className={`status-pill ${shop.status === 'ACTIVE' ? 'status-active' : 'status-waiting'}`}><span /> {shop.status === 'ACTIVE' ? 'Verified' : shop.status === 'PENDING' ? 'Pending review' : 'Rejected'}</span></td></tr>)}</tbody></table></div>}</div>
  </section>
}

const AdminUsersSection = ({ role }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const title = role === 'CUSTOMER' ? 'Customers' : 'Owners'

  useEffect(() => {
    getAdminUsers(role).then((result) => setUsers(result.users || [])).catch(() => setUsers([])).finally(() => setLoading(false))
  }, [role])

  return <section className="admin-data-section"><div className="section-heading"><div><div className="eyebrow dashboard-eyebrow">USER DIRECTORY</div><h1>{title}</h1><p>All registered {title.toLowerCase()} from the current database.</p></div></div><div className="data-panel">{loading ? <div className="data-state">Loading {title.toLowerCase()}...</div> : users.length === 0 ? <div className="data-state">No {title.toLowerCase()} found.</div> : <div className="shop-table-wrap"><table className="shop-table"><thead><tr><th>NAME</th><th>EMAIL</th><th>PHONE</th><th>JOINED</th><th>STATUS</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td><div className="shop-name-cell"><span className="shop-avatar blue">{user.name.slice(0, 2).toUpperCase()}</span><strong>{user.name}</strong></div></td><td>{user.email}</td><td>{user.phone || 'Not provided'}</td><td className="submitted-time">{new Date(user.created_at).toLocaleDateString('en-IN')}</td><td><span className={`status-pill ${user.is_active ? 'status-active' : 'status-waiting'}`}><span /> {user.is_active ? 'Active' : 'Inactive'}</span></td></tr>)}</tbody></table></div>}</div></section>
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
    } catch {
      setPendingShops([])
    }
  }

  const fetchAdminStats = async () => {
    try {
      const result = await getAdminShopStats()
      setStats({ ...emptyStats, ...(result.stats || {}) })
    } catch {
      setStats(emptyStats)
    }
  }

  useEffect(() => {
    Promise.all([getPendingShopRequests(), getAdminShopStats()]).then(([pendingResult, statsResult]) => {
      setPendingShops(pendingResult.shops || [])
      setStats({ ...emptyStats, ...(statsResult.stats || {}) })
    }).catch(() => {
      setPendingShops([])
      setStats(emptyStats)
    })
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
      <AdminSidebar items={adminNavItems} active={active} onNavigate={navigateSection} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={() => navigate('/admins/login')} />
      <section className="admin-main">
        <AdminTopbar active={active} onMenuOpen={() => setSidebarOpen(true)} />
        <div className="dashboard-content">
          {active === 'Dashboard' ? <DashboardOverview pendingShops={pendingShops} stats={stats} onRefresh={async () => { await fetchPendingShops(); await fetchAdminStats() }} onReview={handleReview} />
            : active === 'Shops' ? <AdminShopsSection />
              : active === 'Customers' ? <AdminUsersSection role="CUSTOMER" />
                : active === 'Owners' ? <AdminUsersSection role="OWNER" />
                  : <AdminSectionPlaceholder active={active} onBack={() => setActive('Dashboard')} />}
        </div>
      </section>
    </main>
  )
}
