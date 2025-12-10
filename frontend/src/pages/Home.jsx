import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'
import { fetchWithAuth } from '../utils/api'
import API_BASE_URL from '../config/api'

function Home() {
  const { showToast } = useToast()
  const [sales, setSales] = useState([])
  const [movies, setMovies] = useState([])
  const [totalMovies, setTotalMovies] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authToken')
        if (!token) {
          showToast('You must login first', 'error')
          setLoading(false)
          return
        }

        const salesResponse = await fetchWithAuth(`${API_BASE_URL}/sales`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!salesResponse.ok) {
          throw new Error(`HTTP error! status: ${salesResponse.status}`)
        }

        const salesData = await salesResponse.json()

        if (salesData.status === 'success') {
          setSales(salesData.data.salesData || [])
        } else {
          showToast(salesData.message || 'Failed to load sales data', 'error')
        }

        const moviesResponse = await fetchWithAuth(`${API_BASE_URL}/movies`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        if (!moviesResponse.ok) {
          throw new Error(`HTTP error! status: ${moviesResponse.status}`)
        }
        const moviesData = await moviesResponse.json()
        if (moviesData.status === 'success') {
          const moviesList = moviesData.data.movies || []
          setMovies(moviesList)
          setTotalMovies(moviesList.length)
        } else {
          showToast(moviesData.message || 'Failed to load movie data', 'error')
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        showToast('An error occurred while loading dashboard data', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [showToast])

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
  const totalOrders = sales.length

  const today = new Date().toDateString()
  const todayOrders = sales.filter(sale => {
    const saleDate = new Date(sale.date).toDateString()
    return saleDate === today
  }).length

  const getLast30DaysGrowth = () => {
    const now = new Date()
    const startCurrent = new Date(now)
    startCurrent.setDate(startCurrent.getDate() - 29)

    const startPrev = new Date(startCurrent)
    startPrev.setDate(startPrev.getDate() - 30)

    const currentSales = sales.filter(sale => {
      const d = new Date(sale.date)
      return d >= startCurrent && d <= now
    })

    const prevSales = sales.filter(sale => {
      const d = new Date(sale.date)
      return d >= startPrev && d < startCurrent
    })

    const currentRevenue = currentSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
    const prevRevenue = prevSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)

    if (prevRevenue > 0) {
      return Number((((currentRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1))
    }
    if (currentRevenue > 0) {
      return 100
    }
    return 0
  }

  const revenueGrowth30d = getLast30DaysGrowth()

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()
  const yesterdayOrders = sales.filter(sale => {
    const saleDate = new Date(sale.date).toDateString()
    return saleDate === yesterdayStr
  }).length

  let todayOrdersGrowth = 0
  if (yesterdayOrders > 0) {
    todayOrdersGrowth = Number((((todayOrders - yesterdayOrders) / yesterdayOrders) * 100).toFixed(1))
  } else if (todayOrders > 0) {
    todayOrdersGrowth = 100
  }

  const formatGrowth = (value) => {
    if (value > 0) return `+${value}%`
    if (value < 0) return `-${Math.abs(value)}%`
    return '0%'
  }

  const salesByMovieTitle = sales.reduce((acc, sale) => {
    const title = sale.movieTitle || 'Unknown Movie'
    if (!acc[title]) {
      acc[title] = { sales: 0, revenue: 0 }
    }
    acc[title].sales += 1
    acc[title].revenue += sale.amount || 0
    return acc
  }, {})

  const allMoviesWithSales = movies.map(movie => {
    const salesData = salesByMovieTitle[movie.title] || { sales: 0, revenue: 0 }
    return {
      ...movie,
      sales: salesData.sales,
      revenue: salesData.revenue
    }
  })

  const sortedMovies = allMoviesWithSales.sort((a, b) => {
    
    if (b.sales === a.sales) {
      return b.revenue - a.revenue
    }
    return b.sales - a.sales
  })

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading movies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 backdrop-blur-sm">
      <header className="bg-white/80 backdrop-blur-lg shadow-sm w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <p className="text-emerald-500 text-sm font-medium mb-1">Welcome back, Admin 👋</p>
            <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m8 0H7m8 0v3a1 1 0 01-1 1H8a1 1 0 01-1-1V4" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Movies</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{totalMovies}</p>
            <p className="text-xs text-gray-400">Available in catalog</p>
          </div>
          
          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">Rp {totalRevenue.toLocaleString()}</p>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-green-600 text-xs font-medium">{formatGrowth(revenueGrowth30d)} vs last 30 days</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Today's Orders</p>
            <p className="text-3xl font-bold text-gray-900 mb-1">{todayOrders}</p>
            <div className="flex items-center">
              <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <span className="text-green-600 text-xs font-medium">{formatGrowth(todayOrdersGrowth)} vs yesterday</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Growth Rate</p>
            <p className="text-3xl font-bold text-purple-600 mb-1">{formatGrowth(revenueGrowth30d)}</p>
            <p className="text-xs text-gray-400">Last 30 days comparison</p>
          </div>
        </div>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Top Movies</h2>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Top Movies</h2>
          </div>
          <div className="space-y-3">
            {sortedMovies.map((movie, index) => (
              <div key={movie.id} className="bg-white rounded-xl p-4 hover:bg-gray-50 transition-all duration-200 border border-gray-200">
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-lg font-bold text-gray-400 w-6">{index + 1}</span>
                    {movie.image ? (
                      <img
                        src={`data:image/jpeg;base64,${movie.image}`}
                        alt={movie.title}
                        className="w-16 h-20 object-cover rounded-lg border border-white/40 flex-shrink-0 shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gradient-to-br from-gray-200/60 to-gray-300/60 backdrop-blur-sm rounded-lg border border-white/40 flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 mb-0.5">{movie.title}</h3>
                      <p className="text-gray-500 text-sm">Year: {movie.year}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-bold text-gray-900 mb-0.5">Rp {movie.revenue.toLocaleString()}</p>
                    <p className="text-gray-500 text-xs">
                      {movie.sales > 0 ? `${movie.sales} sold` : '0 sold'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {sortedMovies.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m8 0H7m8 0v3a1 1 0 01-1 1H8a1 1 0 01-1-1V4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No movies found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">Start building your movie collection by adding your first movie to the library.</p>
            <p className="text-gray-500">No sales transactions recorded yet.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default Home
