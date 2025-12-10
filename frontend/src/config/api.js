// API Configuration
// Base URL untuk backend API
// Port backend: 5000
// Jika ingin menggunakan port berbeda, set environment variable VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

export default API_BASE_URL

