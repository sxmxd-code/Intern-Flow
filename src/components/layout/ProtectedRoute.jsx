import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function ProtectedRoute({ allowedRoles }) {
  const { user, role, status, loading } = useAuth()

  // Auth still loading
  if (loading) return <LoadingSpinner />

  // Role/status not yet fetched from DB (async after login)
  if (user && (role === null || status === null)) return <LoadingSpinner />

  // Not logged in
  if (!user) return <Navigate to="/login" replace />

  // Logged in but account is pending admin approval
  if (status === 'pending' || role === 'pending') {
    return <Navigate to="/pending" replace />
  }

  // Logged in but account was rejected
  if (status === 'rejected') {
    return <Navigate to="/pending" replace />
  }

  // Logged in but accessing a route their role doesn't allow
  if (allowedRoles && !allowedRoles.includes(role)) {
    const adminRoles = ['admin', 'staff', 'dept_head']
    return <Navigate to={adminRoles.includes(role) ? '/admin' : '/dashboard'} replace />
  }

  return <Outlet />
}
