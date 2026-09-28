import { Menu, Search } from 'lucide-react'

export default function AdminTopbar({ active, onMenuOpen }) {
  return (
    <header className="admin-topbar">
      <button className="mobile-menu" onClick={onMenuOpen} aria-label="Open navigation"><Menu size={20} /></button>
      <div className="breadcrumb">Workspace <span>/</span> <strong>{active}</strong></div>
      <div className="topbar-right"><span className="preview-badge"><span /> PREVIEW MODE</span><div className="topbar-divider" /><button className="search-button" aria-label="Search"><Search size={18} /></button><div className="topbar-avatar">AD</div></div>
    </header>
  )
}
