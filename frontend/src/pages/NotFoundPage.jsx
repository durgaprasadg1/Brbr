import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import Brand from '../components/Brand.jsx'

export default function NotFoundPage() {
  return (
    <main className="not-found">
      <Brand />
      <h1>That page isn’t here.</h1>
      <p>Head back to sign in to get started.</p>
      <Link className="primary-button" to="/users/login">Back to sign in <ArrowRight size={16} /></Link>
    </main>
  )
}
