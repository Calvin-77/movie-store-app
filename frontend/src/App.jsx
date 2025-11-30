import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { ToastProvider } from './hooks/useToast'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import Login from './pages/Login'
import Home from './pages/Home'
import MovieManagement from './pages/MovieManagement'
import AddMovie from './pages/AddMovie'
import EditMovie from './pages/EditMovie'
import Reports from './pages/Reports'

function AppContent() {
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      setIsAuthenticated(!!token)
      setIsLoading(false)
    }
    
    checkAuth()

    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || !e.key) {
        checkAuth()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)

    const handleAuthChange = () => {
      checkAuth()
    }
    
    window.addEventListener('auth-change', handleAuthChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [location])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    
    if (location.pathname === '/login') {
      return <Navigate to="/dashboard" replace />
    }
    
    return (
      <div className="App w-full flex">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/movies" element={<MovieManagement />} />
            <Route path="/movies/add" element={<AddMovie />} />
            <Route path="/movies/edit/:id" element={<EditMovie />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    )
  }

  if (location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
        <Toast />
      </Router>
    </ToastProvider>
  )
}

export default App
