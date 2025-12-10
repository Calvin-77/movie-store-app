import API_BASE_URL from '../config/api'

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('authToken')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  let response
  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (fetchError) {
    console.error('Fetch error:', fetchError)
    console.error('Request URL:', url)
    console.error('Request options:', options)
    throw new Error(`Network error: ${fetchError.message}. Make sure the backend server is running.`)
  }
  
  if (response.status === 401 && token) {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      
      if (!refreshToken) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userRole')
        window.location.href = '/login'
        return response
      }
      
      const refreshResponse = await fetch(`${API_BASE_URL}/authentications`, {
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
          localStorage.setItem('authToken', refreshData.data.accessToken)
          
          headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`
          response = await fetch(url, {
            ...options,
            headers,
          })
        } else {
          localStorage.removeItem('authToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('userRole')
          window.location.href = '/login'
        }
      } else {
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




