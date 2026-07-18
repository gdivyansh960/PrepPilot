import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import { PageLoader } from './components/Spinner'
import { useAuth } from './hooks/useAuth'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProblemsPage from './pages/ProblemsPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import SettingsPage from './pages/SettingsPage'
import TopicsPage from './pages/TopicsPage'

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <PageLoader />
  return user ? <Navigate to="/dashboard" replace /> : children
}

function PrivatePage({ children }) {
  return <ProtectedRoute><AppShell>{children}</AppShell></ProtectedRoute>
}

function AnimatedRoutes() {
  const location = useLocation()
  const reduceMotion = useReducedMotion()
  const transition = reduceMotion ? { duration: 0 } : { duration: 0.24, ease: 'easeOut' }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
        transition={transition}
      >
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
        <Route path="/dashboard" element={<PrivatePage><DashboardPage /></PrivatePage>} />
        <Route path="/topics" element={<PrivatePage><TopicsPage /></PrivatePage>} />
        <Route path="/problems" element={<PrivatePage><ProblemsPage /></PrivatePage>} />
        <Route path="/profile" element={<PrivatePage><ProfilePage /></PrivatePage>} />
        <Route path="/settings" element={<PrivatePage><SettingsPage /></PrivatePage>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}
