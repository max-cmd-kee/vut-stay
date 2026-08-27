import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastProvider } from './components/Toast'

// Public pages
import Home               from './pages/Home'
import Explore            from './pages/Explore'
import AccommodationDetail from './pages/AccommodationDetail'
import AboutPage          from './pages/AboutPage'
import ContactPage        from './pages/ContactPage'

// Auth pages — rendered WITHOUT Navbar/Footer (standalone layout)
import StudentLogin    from './pages/StudentLogin'
import StudentRegister from './pages/StudentRegister'
import AdminLogin      from './pages/AdminLogin'
import LandlordLogin   from './pages/LandlordLogin'
import LandlordRegister from './pages/LandlordRegister'

// Protected pages
import BookingPage      from './pages/BookingPage'
import StudentDashboard from './pages/StudentDashboard'
import AdminDashboard   from './pages/AdminDashboard'
import LandlordPortal   from './pages/LandlordPortal'

// ── Layout wrappers ──────────────────────────────────────────────────────────
function PublicLayout({ children }) {
  return (
    <div className="vut-app-shell">
      <Navbar />
      <main className="vut-app-main">{children}</main>
      <Footer />
    </div>
  )
}

// Auth and protected portal pages get no public Navbar/Footer
function StandaloneLayout({ children }) {
  return <div className="vut-standalone">{children}</div>
}

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        {/* ── Public routes (Navbar + Footer) ────────────────────────── */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/explore" element={<PublicLayout><Explore /></PublicLayout>} />
        <Route path="/accommodations" element={<PublicLayout><Explore /></PublicLayout>} />
        <Route path="/houses" element={<PublicLayout><Explore /></PublicLayout>} />
        <Route path="/accommodation/:id" element={<PublicLayout><AccommodationDetail /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/contact-us" element={<PublicLayout><ContactPage /></PublicLayout>} />

        {/* ── Student auth (standalone) ───────────────────────────────── */}
        <Route path="/student/login"    element={<StandaloneLayout><StudentLogin /></StandaloneLayout>} />
        <Route path="/student/register" element={<StandaloneLayout><StudentRegister /></StandaloneLayout>} />
        {/* Convenience aliases */}
        <Route path="/login"    element={<Navigate to="/student/login" replace />} />
        <Route path="/register" element={<Navigate to="/student/register" replace />} />

        {/* ── Student protected (Navbar + Footer) ────────────────────── */}
        <Route
          path="/apply"
          element={
            <ProtectedRoute role="student">
              <PublicLayout><BookingPage /></PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute role="student">
              <PublicLayout><BookingPage /></PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute role="student">
              <PublicLayout><StudentDashboard /></PublicLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <PublicLayout><StudentDashboard /></PublicLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Admin auth + protected (standalone) ────────────────────── */}
        <Route path="/admin/login" element={<StandaloneLayout><AdminLogin /></StandaloneLayout>} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <StandaloneLayout><AdminDashboard /></StandaloneLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admindash-board"
          element={
            <ProtectedRoute role="admin">
              <StandaloneLayout><AdminDashboard /></StandaloneLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Landlord auth + protected (standalone) ─────────────────── */}
        <Route path="/landlord/login"    element={<StandaloneLayout><LandlordLogin /></StandaloneLayout>} />
        <Route path="/landlord/register" element={<StandaloneLayout><LandlordRegister /></StandaloneLayout>} />
        <Route
          path="/landlord"
          element={
            <ProtectedRoute role="landlord">
              <StandaloneLayout><LandlordPortal /></StandaloneLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/submit-listing"
          element={
            <ProtectedRoute role="landlord">
              <StandaloneLayout><LandlordPortal /></StandaloneLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Fallback ────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <style>{`
        .vut-app-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .vut-app-main {
          flex: 1 0 auto;
        }
        .vut-standalone {
          min-height: 100vh;
        }
      `}</style>
    </ToastProvider>
  )
}
