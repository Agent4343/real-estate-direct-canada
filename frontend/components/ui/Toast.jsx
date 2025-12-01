'use client'

import { useEffect } from 'react'

export default function Toast({ message, type = 'info', isVisible, onClose, duration = 3000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  }[type]

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} border px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 min-w-[300px] max-w-md animate-slide-in`}>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-current opacity-50 hover:opacity-100"
      >
        ×
      </button>
    </div>
  )
}

