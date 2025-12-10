import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'
import { fetchWithAuth } from '../utils/api'
import API_BASE_URL from '../config/api'

function SalesLineChart({ sales }) {
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  
  const salesDates = sales
    .filter(sale => sale && sale.date)
    .map(sale => {
      const date = new Date(sale.date)
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', sale.date)
        return null
      }
      return date.toISOString().split('T')[0]
    })
    .filter(Boolean)
    .sort()
  
  console.log('Sales dates extracted:', salesDates)
  
  let startDate, endDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (salesDates.length > 0) {
    startDate = new Date(salesDates[0])
    endDate = new Date(salesDates[salesDates.length - 1])
    if (endDate < today) {
      endDate = new Date(today)
    }
  } else {
    endDate = new Date(today)
    startDate = new Date(today)
    startDate.setDate(startDate.getDate() - 30)
  }
  
  const allDates = []
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    const dateLabel = currentDate.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    allDates.push({
      dateKey,
      dateLabel,
      dateObj: new Date(currentDate),
      revenue: 0,
      count: 0
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const salesByDate = sales.reduce((acc, sale) => {
    if (!sale || !sale.date) return acc
    
    const saleDate = new Date(sale.date)
    if (isNaN(saleDate.getTime())) return acc
    
    const dateKey = saleDate.toISOString().split('T')[0]
    
    if (!acc[dateKey]) {
      acc[dateKey] = {
        revenue: 0,
        count: 0
      }
    }
    
    acc[dateKey].revenue += sale.amount || 0
    acc[dateKey].count += 1
    
    return acc
  }, {})

  const chartData = allDates.map(date => {
    const salesData = salesByDate[date.dateKey]
    if (salesData) {
      return {
        ...date,
        revenue: salesData.revenue,
        count: salesData.count
      }
    }
    return date
  })
  
  console.log('Chart data:', chartData)
  console.log('Sales by date:', salesByDate)

  const revenues = chartData.map(d => d.revenue).filter(r => r > 0)
  const maxRevenue = revenues.length > 0 ? Math.max(...revenues) : 50000
  const maxRevenueWithPadding = maxRevenue * 1.1
  const minRevenue = 0
  const range = maxRevenueWithPadding - minRevenue || 1
  const chartHeight = 320
  
  const chartWidth = 1000 
  const padding = 50

  const points = chartData.map((data, index) => {
    const x = padding + (index / (chartData.length - 1 || 1)) * (chartWidth - 2 * padding)
    
    const y = chartHeight - padding - ((data.revenue - minRevenue) / maxRevenueWithPadding) * (chartHeight - 2 * padding)
    return { x, y, ...data }
  })

  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' ')

  const areaPath = points.length > 0
    ? `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : ''

  const handlePointHover = (point, event) => {
    if (point.revenue === 0) return
    
    const svg = event.currentTarget.ownerSVGElement
    const svgRect = svg.getBoundingClientRect()
    const containerRect = svg.parentElement.getBoundingClientRect()
    
    const svgPoint = svg.createSVGPoint()
    svgPoint.x = point.x
    svgPoint.y = point.y
    const screenPoint = svgPoint.matrixTransform(svg.getScreenCTM())
    
    setTooltipPosition({
      x: screenPoint.x - containerRect.left,
      y: screenPoint.y - containerRect.top
    })
    setHoveredPoint(point)
  }

  const handlePointLeave = () => {
    setHoveredPoint(null)
  }

  return (
    <div className="w-full relative">
      <svg 
        width="100%" 
        height={chartHeight} 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', height: '320px', maxWidth: '100%' }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding)
          const value = minRevenue + ratio * maxRevenueWithPadding
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={chartWidth - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding - 10}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fill="#6b7280"
              >
                {Math.round(value).toLocaleString()}
              </text>
            </g>
          )
        })}
        {areaPath && (
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.3"
          />
        )}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={pathData}
          fill="none"
          stroke="#9333ea"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point, index) => {
          if (point.revenue === 0) return null
          const isHovered = hoveredPoint && hoveredPoint.dateKey === point.dateKey
          return (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="20"
                fill="transparent"
                onMouseEnter={(e) => handlePointHover(point, e)}
                onMouseLeave={handlePointLeave}
                style={{ cursor: 'pointer' }}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={isHovered ? "6" : "4"}
                fill={isHovered ? "#7c3aed" : "#9333ea"}
                stroke="white"
                strokeWidth={isHovered ? "3" : "2"}
                style={{ transition: 'all 0.2s ease', cursor: 'pointer', pointerEvents: 'all' }}
                onMouseEnter={(e) => handlePointHover(point, e)}
                onMouseLeave={handlePointLeave}
              />
              {isHovered && (
                <line
                  x1={point.x}
                  y1={padding}
                  x2={point.x}
                  y2={chartHeight - padding}
                  stroke="#9333ea"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
              )}
            </g>
          )
        })}
        {chartData.map((data, index) => {
          if (index % 5 !== 0 && index !== chartData.length - 1) return null
          const x = padding + (index / (chartData.length - 1 || 1)) * (chartWidth - 2 * padding)
          return (
            <text
              key={index}
              x={x}
              y={chartHeight - padding + 20}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
              transform={`rotate(-45, ${x}, ${chartHeight - padding + 20})`}
            >
              {data.dateLabel}
            </text>
          )
        })}
      </svg>
      {hoveredPoint && hoveredPoint.revenue > 0 && (
        <div
          className="absolute bg-gray-900 text-white rounded-lg shadow-xl p-3 pointer-events-none z-10"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-10px',
            minWidth: '180px'
          }}
        >
          <div className="text-xs font-semibold text-gray-300 mb-1">
            {hoveredPoint.dateLabel}
          </div>
          <div className="text-lg font-bold text-white">
            Rp {hoveredPoint.revenue.toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {hoveredPoint.count} {hoveredPoint.count === 1 ? 'transaction' : 'transactions'}
          </div>
          <div
            className="absolute left-1/2 transform -translate-x-1/2"
            style={{
              bottom: '-6px',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #111827'
            }}
          />
        </div>
      )}
    </div>
  )
}

function Reports() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month') 
  const [sales, setSales] = useState([])
  const [movies, setMovies] = useState([])

  useEffect(() => {
    const loadReportsData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('authToken')
        if (!token) {
          showToast('You must login first', 'error')
          setLoading(false)
          return
        }

        const response = await fetchWithAuth(`${API_BASE_URL}/sales`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.status === 'success') {
          setSales(data.data.salesData || [])
        } else {
          showToast(data.message || 'Failed to load sales report', 'error')
        }

        const moviesResponse = await fetchWithAuth(`${API_BASE_URL}/movies`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        if (moviesResponse.ok) {
          const moviesData = await moviesResponse.json()
          if (moviesData.status === 'success') {
            setMovies(moviesData.data.movies || [])
          }
        }
      } catch (error) {
        console.error('Error loading reports data:', error)
        showToast('An error occurred while loading sales report', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadReportsData()
  }, [showToast])

  const getPeriodSummary = (days) => {
    const now = new Date()
    const startCurrent = new Date(now)
    startCurrent.setDate(startCurrent.getDate() - days + 1)

    const startPrev = new Date(startCurrent)
    startPrev.setDate(startPrev.getDate() - days)

    const currentSales = sales.filter(sale => {
      const d = new Date(sale.date)
      return d >= startCurrent && d <= now
    })

    const prevSales = sales.filter(sale => {
      const d = new Date(sale.date)
      return d >= startPrev && d < startCurrent
    })

    const revenue = currentSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
    const orders = currentSales.length
    const uniqueMovies = new Set(currentSales.map(sale => sale.movieTitle).filter(Boolean))
    const movies = uniqueMovies.size

    const prevRevenue = prevSales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
    let growth = 0
    if (prevRevenue > 0) {
      growth = ((revenue - prevRevenue) / prevRevenue) * 100
    } else if (revenue > 0) {
      growth = 100
    }

    const period = `${startCurrent.toLocaleDateString('id-ID')} - ${now.toLocaleDateString('id-ID')}`

    return {
      revenue,
      orders,
      movies,
      growth: Number.isFinite(growth) ? Number(growth.toFixed(1)) : 0,
      currentSales,
      period,
    }
  }

  const weekSummary = getPeriodSummary(7)
  const monthSummary = getPeriodSummary(30)

  const getAllTimeSummary = () => {
    const revenue = sales.reduce((sum, sale) => sum + (sale.amount || 0), 0)
    const orders = sales.length
    const uniqueMovies = new Set(sales.map(sale => sale.movieTitle).filter(Boolean))
    const movies = uniqueMovies.size

    return {
      revenue,
      orders,
      movies,
      growth: 0, 
      currentSales: sales,
      period: 'All Time',
    }
  }

  let currentData
  if (selectedPeriod === 'week') {
    currentData = weekSummary
  } else if (selectedPeriod === 'month') {
    currentData = monthSummary
  } else {
    currentData = getAllTimeSummary()
  }

  const periodSales = currentData.currentSales || []

  const formatGrowth = (value) => {
    if (value > 0) return `+${value}%`
    if (value < 0) return `-${Math.abs(value)}%`
    return '0%'
  }

  const periodMovieAggregates = periodSales.reduce((acc, sale) => {
    const title = sale.movieTitle || 'Unknown Movie'
    if (!acc[title]) {
      acc[title] = { title, sales: 0, revenue: 0 }
    }
    acc[title].sales += 1
    acc[title].revenue += sale.amount || 0
    return acc
  }, {})

  let topMoviesPeriod
  if (selectedPeriod === 'all') {
    const allMoviesWithSales = movies.map(movie => {
      const salesData = periodMovieAggregates[movie.title] || { sales: 0, revenue: 0 }
      return {
        ...movie,
        sales: salesData.sales,
        revenue: salesData.revenue
      }
    })
    
    topMoviesPeriod = allMoviesWithSales.sort((a, b) => {
      if (b.sales === a.sales) {
        return b.revenue - a.revenue
      }
      return b.sales - a.sales
    })
  } else {
    topMoviesPeriod = Object.values(periodMovieAggregates)
      .sort((a, b) => {
        if (b.sales === a.sales) {
          return b.revenue - a.revenue
        }
        return b.sales - a.sales
      })
      .slice(0, 5)
  }

  const sortedPeriodSales = [...periodSales].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-lg shadow-sm w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Reports
              </h1>
              <p className="text-gray-600">Movie sales analysis and statistics</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedPeriod('week')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
                  selectedPeriod === 'week'
                    ? 'bg-gradient-to-r from-purple-500/90 to-purple-600/90 text-white shadow-lg border border-white/30'
                    : 'bg-white/40 text-gray-700 hover:bg-white/60 border border-white/30'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
                  selectedPeriod === 'month'
                    ? 'bg-gradient-to-r from-purple-500/90 to-purple-600/90 text-white shadow-lg border border-white/30'
                    : 'bg-white/40 text-gray-700 hover:bg-white/60 border border-white/30'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPeriod('all')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 backdrop-blur-sm ${
                  selectedPeriod === 'all'
                    ? 'bg-gradient-to-r from-purple-500/90 to-purple-600/90 text-white shadow-lg border border-white/30'
                    : 'bg-white/40 text-gray-700 hover:bg-white/60 border border-white/30'
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid grid-cols-1 gap-6 mb-8 ${selectedPeriod === 'all' ? 'md:grid-cols-3' : 'md:grid-cols-4'}`}>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">Rp {currentData.revenue.toLocaleString()}</p>
                {selectedPeriod !== 'all' && (
                  <div className="flex items-center mt-2">
                    <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-green-600 text-sm font-medium">
                      {formatGrowth(currentData.growth)} from previous period
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{currentData.orders}</p>
                {selectedPeriod !== 'all' && (
                  <div className="flex items-center mt-2">
                    <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-blue-600 text-sm font-medium">
                      {formatGrowth(currentData.growth)} from previous period
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Movies Sold</p>
                <p className="text-3xl font-bold text-gray-900">{currentData.movies}</p>
                {selectedPeriod !== 'all' && (
                  <div className="flex items-center mt-2">
                    <svg className="w-4 h-4 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span className="text-purple-600 text-sm font-medium">
                      {formatGrowth(currentData.growth)} from previous period
                    </span>
                  </div>
                )}
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m8 0H7m8 0v3a1 1 0 01-1 1H8a1 1 0 01-1-1V4" />
                </svg>
              </div>
            </div>
          </div>

          {selectedPeriod !== 'all' && (
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Growth</p>
                  <p className="text-3xl font-bold text-purple-600">{formatGrowth(currentData.growth)}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600 text-sm font-medium">Target achieved</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Daily Sales</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedPeriodSales.length === 0 && (
                <p className="text-sm text-gray-500">No sales transactions in this period.</p>
              )}
              {sortedPeriodSales.map((sale) => {
                const date = new Date(sale.date)
                const formattedDate = date.toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
                return (
                  <div
                    key={sale.id}
                    className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-3 py-2"
                  >
                    <div className="flex flex-col">
                      <span className="text-gray-700">{formattedDate}</span>
                      <span className="text-gray-500">
                        {sale.movieTitle || 'Top-up / Other transaction'}
                      </span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      Rp {(sale.amount || 0).toLocaleString()}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Movies</h3>
            <div className={selectedPeriod === 'all' ? 'space-y-3 max-h-96 overflow-y-auto' : 'space-y-4'}>
              {topMoviesPeriod.length === 0 && (
                <p className="text-sm text-gray-500">No movies sold in this period.</p>
              )}
              {topMoviesPeriod.map((movie, index) => (
                <div 
                  key={selectedPeriod === 'all' ? movie.id : movie.title} 
                  className={`${selectedPeriod === 'all' ? 'bg-white rounded-xl p-4 hover:bg-gray-50 transition-all duration-200 border border-gray-200' : ''} flex items-center justify-between`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {selectedPeriod === 'all' ? (
                      <>
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
                          <p className="text-gray-500 text-sm">Year: {movie.year || 'N/A'}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{movie.title}</p>
                          <p className="text-xs text-gray-500">{movie.sales} sold</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className={`text-right flex-shrink-0 ${selectedPeriod === 'all' ? '' : 'text-sm font-medium text-gray-900'}`}>
                    {selectedPeriod === 'all' ? (
                      <>
                        <p className="text-lg font-bold text-gray-900 mb-0.5">Rp {movie.revenue.toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">
                          {movie.sales > 0 ? `${movie.sales} sold` : '0 sold'}
                        </p>
                      </>
                    ) : (
                      <p>Rp {movie.revenue.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {selectedPeriod !== 'all' && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Period Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">Period</p>
                <p className="text-lg font-semibold text-gray-900">{currentData.period}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average per Day</p>
                <p className="text-lg font-semibold text-gray-900">
                  Rp {Math.round(currentData.revenue / (selectedPeriod === 'week' ? 7 : 30)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Growth</p>
                <p className="text-lg font-semibold text-green-600">{formatGrowth(currentData.growth)}</p>
              </div>
            </div>
          </div>
        )}
        {selectedPeriod === 'all' && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Chart (All Time)</h3>
            <div className="w-full" style={{ minHeight: '320px' }}>
              <SalesLineChart sales={sales} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Reports
