import { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  })

  const showToast = (message, type = 'success') => {
    setToast({
      isVisible: true,
      message: message,
      type: type
    })
  }

  const hideToast = () => {
    setToast({
      isVisible: false,
      message: '',
      type: 'success'
    })
  }

  const value = {
    toast,
    showToast,
    hideToast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}
