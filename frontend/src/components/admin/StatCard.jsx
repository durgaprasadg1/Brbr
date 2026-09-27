import { ArrowUpRight } from 'lucide-react'

export default function StatCard({ icon: Icon, label, value, change, trend, note, color }) {
  return (
    <article className="stat-card">
      <div className="stat-top"><span className={`stat-icon stat-${color}`}><Icon size={18} /></span><button className="stat-more" aria-label={`${label} details`}>···</button></div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-change">
        {trend === 'up' ? <span className="trend-up"><ArrowUpRight size={13} /> {change}</span> : <span className="trend-neutral">{change}</span>}
        <span>{note}</span>
      </div>
    </article>
  )
}
