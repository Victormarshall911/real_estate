import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" id="not-found-page">
      <div className="text-center max-w-md animate-fade-in-up">
        <div className="text-8xl font-extrabold text-primary/10 mb-4">404</div>
        <h1 className="text-2xl font-bold text-text-primary mb-3">Page Not Found</h1>
        <p className="text-sm text-text-muted mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98]"
        >
          <Home className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    </div>
  )
}
