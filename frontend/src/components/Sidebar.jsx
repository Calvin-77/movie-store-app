import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LogoutModal from './LogoutModal'

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeItem, setActiveItem] = useState(location.pathname)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const refreshToken = localStorage.getItem('refreshToken')

      if (token && refreshToken) {
        
        await fetch('http://localhost:3001/authentications', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            refreshToken: refreshToken
          })
        })
      }

      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      
      setShowLogoutConfirm(false)

      window.location.href = '/login'
    } catch (error) {
      console.error('Error during logout:', error)
      
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      
      setShowLogoutConfirm(false)
      window.location.href = '/login'
    }
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  const menuItems = [
    {
      id: '/dashboard',
      name: 'Dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      )
    },
    {
      id: '/movies',
      name: 'Movie Management',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m8 0H7m8 0v3a1 1 0 01-1 1H8a1 1 0 01-1-1V4" />
        </svg>
      )
    },
    {
      id: '/reports',
      name: 'Reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ]

  return (
    <div className="w-64 bg-white shadow-lg h-screen fixed left-0 top-0 z-40">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <h1 className="text-gray-700 font-bold text-lg">
            FilmHub
          </h1>
        </div>
      </div>
      <nav className="mt-6 px-4">
        <h3 className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">Menu</h3>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                to={item.id}
                onClick={() => setActiveItem(item.id)}
                className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors duration-200 ${
                  location.pathname === item.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className={`mr-3 ${location.pathname === item.id ? 'text-purple-700' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                <span className="font-medium">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <button 
          onClick={handleLogout}
          className="flex items-center px-3 py-3 text-gray-600 hover:text-red-600 transition-colors duration-200 font-medium rounded-lg hover:bg-red-50"
        >
          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
      <LogoutModal
        isOpen={showLogoutConfirm}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

    </div>
  )
}

export default Sidebar
