'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function PropertyCard({ property }) {
  const formatPrice = (price) => {
    if (!price && price !== 0) return '$0'
    try {
      return new Intl.NumberFormat('en-CA', {
        style: 'currency',
        currency: 'CAD',
        maximumFractionDigits: 0,
      }).format(price)
    } catch {
      return `$${price?.toLocaleString('en-CA') || '0'}`
    }
  }

  const imageUrl = property.images?.[0]?.url || '/placeholder-property.jpg'
  const fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : `http://localhost:3000${imageUrl}`

  return (
    <Link href={`/properties/${property._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer">
        {/* Property Image */}
        <div className="relative h-48 bg-gray-200">
          {property.images && property.images.length > 0 ? (
            <img
              src={fullImageUrl}
              alt={property.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-property.jpg'
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
              {property.status}
            </span>
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4">
          <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
            {property.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2">
            {property.address?.street}, {property.city}, {property.province}
          </p>
          <div className="text-2xl font-bold text-blue-600 mb-3">
            {formatPrice(property.price)}
          </div>
          
          {/* Property Features */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            {property.bedrooms > 0 && (
              <span className="flex items-center">
                🛏️ {property.bedrooms} bed
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center">
                🚿 {property.bathrooms} bath
              </span>
            )}
            {property.squareFootage && (
              <span className="flex items-center">
                📐 {property.squareFootage?.toLocaleString('en-CA') || property.squareFootage} sqft
              </span>
            )}
          </div>

          {/* Property Type */}
          <div className="mt-3">
            <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {property.propertyType}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

