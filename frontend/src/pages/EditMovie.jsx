import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useToast } from '../hooks/useToast'
import { fetchWithAuth } from '../utils/api'

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result
      const base64 = typeof result === 'string' ? result.split(',')[1] || result : result
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function EditMovie() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    year: '',
    price: '',
    video: '',
    image: '',
    imageFile: null,
  })
  const [previewImage, setPreviewImage] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMovie, setLoadingMovie] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadMovieData()
  }, [id])

  const loadMovieData = async () => {
    try {
      setLoadingMovie(true)
      
      const token = localStorage.getItem('authToken')
      if (!token) {
        showToast('Anda harus login terlebih dahulu', 'error')
        navigate('/movies')
        return
      }
      
      const response = await fetchWithAuth(`http://localhost:5000/movies/${id}`, {
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
        const movie = data.data.movie
        
        setFormData(prev => ({
          ...prev,
          title: movie.title,
          synopsis: movie.synopsis,
          year: movie.year.toString(),
          price: movie.price.toString(),
          video: movie.video,
          image: movie.image || '',
          imageFile: null,
        }))

        if (movie.image) {
          setPreviewImage(`data:image/jpeg;base64,${movie.image}`)
        } else {
          setPreviewImage('')
        }
      } else {
        showToast('Failed to load movie data', 'error')
        navigate('/movies')
      }
      
    } catch (error) {
      console.error('Error loading movie:', error)
      showToast('Failed to load movie data', 'error')
      navigate('/movies')
    } finally {
      setLoadingMovie(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0] ? e.target.files[0] : null

    setFormData(prev => ({
      ...prev,
      imageFile: file
    }))

    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }))
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setPreviewImage(objectUrl)
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Movie title is required'
    }
    
    if (!formData.synopsis.trim()) {
      newErrors.synopsis = 'Synopsis is required'
    }
    
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Year must be valid'
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    
    if (!formData.video.trim()) {
      newErrors.video = 'Video URL is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        showToast('Anda harus login terlebih dahulu', 'error')
        return
      }

      let imageToSend = formData.image || null

      if (formData.imageFile) {
        try {
          imageToSend = await fileToBase64(formData.imageFile)
        } catch (err) {
          console.error('Error converting image to base64:', err)
          showToast('Failed to process image file', 'error')
          setLoading(false)
          return
        }
      }

      const movieData = {
        title: formData.title.trim(),
        synopsis: formData.synopsis.trim(),
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        video: formData.video.trim(),
        image: imageToSend
      }
      
      console.log('Updated movie data:', movieData)
      
      const response = await fetchWithAuth(`http://localhost:5000/movies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(movieData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === 'success') {
        
        showToast('Movie updated successfully!', 'success')

        navigate('/movies')
      } else {
        showToast(data.message || 'Failed to update movie', 'error')
      }
      
    } catch (error) {
      console.error('Error updating movie:', error)
      showToast('An error occurred while updating movie', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/movies')
  }

  if (loadingMovie) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading movie data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">

      <header className="bg-white/80 backdrop-blur-lg shadow-sm w-full border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Edit Movie
            </h1>
            <p className="text-gray-600">Update movie information</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="md:col-span-2">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Movie Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter movie title"
                    />
                    {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                  </div>

                  <div>
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                      Release Year *
                    </label>
                    <input
                      type="number"
                      id="year"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.year ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="2024"
                    />
                    {errors.year && <p className="mt-1 text-sm text-red-600">{errors.year}</p>}
                  </div>

                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Price (Rp) *
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="50000"
                    />
                    {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
                <div>
                  <label htmlFor="synopsis" className="block text-sm font-medium text-gray-700 mb-2">
                    Synopsis *
                  </label>
                  <textarea
                    id="synopsis"
                    name="synopsis"
                    value={formData.synopsis}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.synopsis ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter movie synopsis"
                  />
                  {errors.synopsis && <p className="mt-1 text-sm text-red-600">{errors.synopsis}</p>}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Media</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
                      URL Video *
                    </label>
                    <input
                      type="url"
                      id="video"
                      name="video"
                      value={formData.video}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.video ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://example.com/video.mp4"
                    />
                    {errors.video && <p className="mt-1 text-sm text-red-600">{errors.video}</p>}
                    
                    {formData.video && formData.video.trim() !== '' && (
                      <button
                        type="button"
                        onClick={() => window.open(formData.video, '_blank')}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Watch Video</span>
                      </button>
                    )}
                  </div>

                  <div>
                    <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                      Poster Image File
                    </label>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Optional. Select a new file to replace the current poster.
                    </p>
                    {previewImage && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-1">Current poster:</p>
                        <img
                          src={previewImage}
                          alt="Current poster"
                          className="w-32 h-48 object-cover rounded border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Movie
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}

export default EditMovie
