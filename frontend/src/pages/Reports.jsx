import { useState, useEffect } from 'react'
import { useToast } from '../hooks/useToast'

function SalesLineChart({ sales }) {
  
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const allDates = []
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + i)
    const dateKey = date.toISOString().split('T')[0]
    const dateLabel = date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    allDates.push({
      dateKey,
      dateLabel,
      dateObj: date,
      revenue: 0,
      count: 0
    })
  }

  const salesByDate = sales.reduce((acc, sale) => {
    const saleDate = new Date(sale.date)
    const dateKey = saleDate.toISOString().split('T')[0]
    
    if (acc[dateKey]) {
      acc[dateKey].revenue += sale.amount || 0
      acc[dateKey].count += 1
    }
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

  const maxRevenue = 50000
  const minRevenue = 0
  const range = maxRevenue - minRevenue || 1
  const chartHeight = 320
  
  const chartWidth = 1000 
  const padding = 50

  const points = chartData.map((data, index) => {
    const x = padding + (index / (chartData.length - 1 || 1)) * (chartWidth - 2 * padding)
    
    const y = chartHeight - padding - ((data.revenue - minRevenue) / range) * (chartHeight - 2 * padding)
    return { x, y, ...data }
  })

  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  }).join(' ')

  const areaPath = points.length > 0
    ? `${pathData} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`
    : ''

  return (
    <div className="w-full">
      <svg 
        width="100%" 
        height={chartHeight} 
        viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
        preserveAspectRatio="xMidYMid meet"
        style={{ display: 'block', height: '320px', maxWidth: '100%' }}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = chartHeight - padding - ratio * (chartHeight - 2 * padding)
          const value = minRevenue + ratio * range
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
          return (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#9333ea"
                stroke="white"
                strokeWidth="2"
              />
              <title>
                {point.dateLabel}: Rp {point.revenue.toLocaleString()} ({point.count} transactions)
              </title>
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
    </div>
  )
}

function Reports() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('month') 
  const [sales, setSales] = useState([])

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

        const response = await fetch('http://localhost:3001/sales', {
          headers: {
            'Authorization': `Bearer ${token}`,
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

  const topMoviesPeriod = Object.values(periodMovieAggregates)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)

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
    <div className="min-h-screen w-full bg-gray-50">
      <header className="bg-white shadow-sm w-full">
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
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedPeriod === 'week'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setSelectedPeriod('month')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedPeriod === 'month'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPeriod('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  selectedPeriod === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Movies</h3>
            <div className="space-y-4">
              {topMoviesPeriod.length === 0 && (
                <p className="text-sm text-gray-500">No movies sold in this period.</p>
              )}
              {topMoviesPeriod.map((movie, index) => (
                <div key={movie.title} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{movie.title}</p>
                      <p className="text-xs text-gray-500">{movie.sales} sold</p>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    Rp {movie.revenue.toLocaleString()}
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
