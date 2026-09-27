import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowLeft, ArrowRight, BarChart3, ChevronDown, Clock3, Home, Scissors, ShieldCheck, Store, Users, X } from 'lucide-react'
import AdminSidebar from '../components/admin/AdminSidebar.jsx'
import AdminTopbar from '../components/admin/AdminTopbar.jsx'
import StatCard from '../components/admin/StatCard.jsx'

const adminNavItems = [
  { id: 'Dashboard', icon: Home },
  { id: 'Shops', icon: Store },
  { id: 'Customers', icon: Users },
  { id: 'Owners', icon: Scissors },
  { id: 'Analytics', icon: BarChart3 },
]

const sampleShops = [
  { name: 'The Modern Man', owner: 'Arjun Mehta', location: 'Indiranagar, Bengaluru', time: '12 min ago', initials: 'MM', color: 'peach' },
  { name: 'Crown & Comb', owner: 'Rahul Nair', location: 'Koramangala, Bengaluru', time: '38 min ago', initials: 'CC', color: 'blue' },
  { name: 'Fade Theory', owner: 'Kabir Shah', location: 'HSR Layout, Bengaluru', time: '1 hr ago', initials: 'FT', color: 'green' },
]

const adminStats = [
  { icon: Store, label: 'Total shops', value: '1,284', change: '12.8%', trend: 'up', note: 'vs. previous 30 days', color: 'violet' },
  { icon: Users, label: 'Registered customers', value: '8,549', change: '8.2%', trend: 'up', note: 'vs. previous 30 days', color: 'orange' },
  { icon: Scissors, label: 'Active owners', value: '972', change: '3.1%', trend: 'up', note: 'vs. previous 30 days', color: 'green' },
  { icon: Clock3, label: 'Pending approvals', value: '08', change: 'Needs review', trend: 'neutral', note: 'shops awaiting your review', color: 'blue' },
]

const DashboardOverview = ({ onViewShops }) => {
  const [showPreviewNotice, setShowPreviewNotice] = useState(true)

  return <>
    <div className="dashboard-heading">
      <div><div className="eyebrow dashboard-eyebrow">SUNDAY, SEPTEMBER 27, 2026</div><h1>Good morning, Admin <span className="wave">✳</span></h1><p>Here’s what’s happening across Chairside today.</p></div>
      <button className="date-filter">Last 30 days <ChevronDown size={15} /></button>
    </div>
    {showPreviewNotice && <div className="preview-alert"><span className="alert-icon"><Activity size={17} /></span><span><strong>Dashboard preview</strong> — sample figures below are illustrative; no live platform data is connected.</span><button aria-label="Dismiss preview message" onClick={() => setShowPreviewNotice(false)}><X size={16} /></button></div>}
    <div className="stats-grid">{adminStats.map((stat) => <StatCard key={stat.label} {...stat} />)}</div>
    <section className="pending-panel">
      <div className="panel-heading">
        <div><div className="panel-title-row"><h2>Pending shop approvals</h2><span className="pending-count">08 pending</span></div><p>Review new shops before they go live on Chairside.</p></div>
        <button className="view-all" onClick={onViewShops}>View all shops <ArrowRight size={15} /></button>
      </div>
      <div className="shop-table-wrap"><table className="shop-table">
        <thead><tr><th>SHOP</th><th>OWNER</th><th>LOCATION</th><th>SUBMITTED</th><th>STATUS</th><th /></tr></thead>
        <tbody>{sampleShops.map((shop) => (
          <tr key={shop.name}>
            <td><div className="shop-name-cell"><span className={`shop-avatar ${shop.color}`}>{shop.initials}</span><strong>{shop.name}</strong></div></td>
            <td>{shop.owner}</td><td>{shop.location}</td><td className="submitted-time">{shop.time}</td>
            <td><span className="status-pill"><span /> Pending review</span></td>
            <td><button className="row-more" aria-label={`More options for ${shop.name}`}>…</button></td>
          </tr>
        ))}</tbody>
      </table></div>
      <div className="panel-footer"><span>Showing <strong>3</strong> of <strong>8</strong> pending applications</span><button onClick={onViewShops}>Review applications <ArrowRight size={14} /></button></div>
    </section>
    <div className="dashboard-footnote"><ShieldCheck size={14} /> Preview controls do not approve shops or modify platform records.</div>
  </>
}

const AdminSectionPlaceholder = ({ active, onBack }) => {
  const Icon = adminNavItems.find((item) => item.id === active)?.icon || Activity

  return <section className="section-placeholder">
    <div className="placeholder-icon"><Icon size={23} /></div>
    <div className="card-kicker">ADMIN WORKSPACE</div>
    <h1>{active}</h1>
    <p>This section is part of the admin navigation preview. Live records and management actions will be available after backend integration.</p>
    <button className="primary-button placeholder-back" onClick={onBack}><ArrowLeft size={15} /> Back to dashboard</button>
  </section>
}

export default function AdminDashboardPage() {
  const [active, setActive] = useState('Dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const navigateSection = (section) => {
    setActive(section)
    setSidebarOpen(false)
  }

  return (
    <main className="admin-shell">
      <AdminSidebar items={adminNavItems} active={active} onNavigate={navigateSection} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={() => navigate('/admin/login')} />
      <section className="admin-main">
        <AdminTopbar active={active} onMenuOpen={() => setSidebarOpen(true)} />
        <div className="dashboard-content">
          {active === 'Dashboard'
            ? <DashboardOverview onViewShops={() => navigateSection('Shops')} />
            : <AdminSectionPlaceholder active={active} onBack={() => setActive('Dashboard')} />}
        </div>
      </section>
    </main>
  )
}
