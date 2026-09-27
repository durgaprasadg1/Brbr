import { ArrowRight, ChevronDown, LogOut, X } from 'lucide-react'
import Brand from '../Brand.jsx'

export default function AdminSidebar({ items, active, onNavigate, open, onClose, onLogout }) {
  return (
    <>
      {open && <button className="sidebar-scrim" onClick={onClose} aria-label="Close navigation"><X size={20} /></button>}
      <aside className={`admin-sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top"><Brand light /><button className="mobile-close" onClick={onClose} aria-label="Close navigation"><X size={18} /></button></div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Admin navigation">
          {items.map(({ id, icon: Icon }) => (
            <button key={id} className={`sidebar-link ${active === id ? 'sidebar-link-active' : ''}`} onClick={() => onNavigate(id)}>
              <Icon size={17} /><span>{id}</span>{id === 'Shops' && <span className="nav-count">8</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help"><div className="help-spark">✳</div><strong>Need a hand?</strong><span>Visit the admin help center.</span><button onClick={() => onNavigate('Help center')}>Get support <ArrowRight size={13} /></button></div>
          <button className="sidebar-link logout-link" onClick={onLogout}><LogOut size={17} /><span>Log out</span></button>
          <div className="admin-profile"><div className="profile-avatar">AD</div><div><strong>Admin preview</strong><small>Administrator</small></div><ChevronDown size={15} /></div>
        </div>
      </aside>
    </>
  )
}
