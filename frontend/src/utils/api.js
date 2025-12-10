/**
 * Helper function untuk fetch dengan auto-refresh token
 */
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('authToken')
  
  // Set default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // Make request
  let response = await fetch(url, {
    ...options,
    headers,
  })      
  
  // If token expired (401), try to refresh
  if (response.status === 401 && token) {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userRole')
        window.location.href = '/login'
        return response
      }
      
      // Try to refresh access token
      const refreshResponse = await fetch('http://localhost:5000/authentications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      })
      
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json()
        
        if (refreshData.status === 'success' && refreshData.data?.accessToken) {
          // Save new access token
          localStorage.setItem('authToken', refreshData.data.accessToken)
          
          // Retry original request with new token
          headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`
          response = await fetch(url, {
            ...options,
            headers,
          })
        } else {
          // Refresh failed, redirect to login
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('userRole')
          window.location.href = '/login'
        }
      } else {
        // Refresh failed, redirect to login
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userRole')
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
      localStorage.removeItem('authToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('userRole')
      window.location.href = '/login'
    }
  }
  
  return response
}




