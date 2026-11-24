import { useAuthStore } from '@/store/auth'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const token = useAuthStore((s) => s.token)
  const location = useLocation()

  if (!token) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  return children
}
