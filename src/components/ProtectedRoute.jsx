import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { studentAuth, adminAuth, landlordAuth } from '../services/authService'

const REDIRECT = {
  student:  '/student/login',
  admin:    '/admin/login',
  landlord: '/landlord/login'
}

const CHECK = {
  student:  () => studentAuth.isLoggedIn(),
  admin:    () => adminAuth.isLoggedIn(),
  landlord: () => landlordAuth.isLoggedIn()
}

/**
 * Wraps a route so only authenticated users of the given role can access it.
 * Unauthenticated visitors are redirected to the appropriate login page,
 * and the original destination is preserved in `?redirect=` so they can be
 * sent back after login.
 */
export default function ProtectedRoute({ role, children }) {
  const location = useLocation()
  const isAuthenticated = CHECK[role]?.()

  if (!isAuthenticated) {
    const loginPath = REDIRECT[role] || '/'
    const redirectParam = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`${loginPath}?redirect=${redirectParam}`} replace />
  }

  return children
}
