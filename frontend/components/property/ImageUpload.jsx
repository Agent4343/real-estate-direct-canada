'use client'

import { useState, useRef } from 'react'

export default function ImageUpload({ onImagesChange, maxImages = 10 }) {
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const remainingSlots = maxImages - images.length
    
    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s)`)
      return
    }

    const newFiles = files.slice(0, remainingSlots)
    
    // Create previews
    const newPreviews = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }))

    setImages([...images, ...newFiles])
    setPreviews([...previews, ...newPreviews])
    
    if (onImagesChange) {
      onImagesChange([...images, ...newFiles])
    }
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    
    // Revoke object URL to free memory
    if (previews[index]?.preview) {
      URL.revokeObjectURL(previews[index].preview)
    }
    
    setImages(newImages)
    setPreviews(newPreviews)
    
    if (onImagesChange) {
      onImagesChange(newImages)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    if (files.length > 0) {
      const event = { target: { files } }
      handleFileSelect(event)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={images.length >= maxImages}
        />
        <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-600 mb-2">
          Click to upload or drag and drop
        </p>
        <p className="text-sm text-gray-500">
          {images.length} / {maxImages} images
          {images.length > 0 && ' • '}
          {images.length > 0 && (
            <span className="text-blue-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); setImages([]); setPreviews([]); onImagesChange?.([]); }}>
              Clear all
            </span>
          )}
        </p>
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview.preview}
                alt={preview.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeImage(index)
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Main
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

