import { Link } from 'react-router-dom'
import { Scissors } from 'lucide-react'

export default function Brand({ light = false }) {
  return (
    <Link className={`brand ${light ? 'brand-light' : ''}`} to="/login" aria-label="Chairside home">
      <span className="brand-mark"><Scissors size={19} strokeWidth={2.4} /></span>
      <span>chairside<span className="brand-period">.</span></span>
    </Link>
  )
}
