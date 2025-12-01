'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { propertiesAPI } from '@/lib/api'
import PropertyCard from '@/components/property/PropertyCard'
import SearchFilters from '@/components/property/SearchFilters'

export default function HomePage() {
  const [mounted, setMounted] = useState(false)
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    province: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    bedrooms: '',
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchProperties()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, filters])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '')
      )
      const response = await propertiesAPI.getAll(params)
      setProperties(response.data.properties || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-12 mb-12 text-white">
        <h1 className="text-5xl font-bold mb-4">
          Buy & Sell Real Estate in Canada
        </h1>
        <p className="text-xl mb-8">
          Direct transactions without realtors. Save thousands on fees.
        </p>
        <div className="flex gap-4">
          <Link
            href="/properties/new"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            List Your Property
          </Link>
          <Link
            href="/properties"
            className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Browse Properties
          </Link>
        </div>
      </div>

      {/* Search Filters */}
      <SearchFilters filters={filters} setFilters={setFilters} />

      {/* Properties Grid */}
      <div className="mt-8">
        <h2 className="text-3xl font-bold mb-6">Featured Properties</h2>
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No properties found. Be the first to list!</p>
            <Link
              href="/properties/new"
              className="mt-4 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              List Your Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🏠</div>
          <h3 className="text-xl font-bold mb-2">Direct Listings</h3>
          <p className="text-gray-600">
            List and browse properties directly without realtor fees
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold mb-2">Compare Mortgages</h3>
          <p className="text-gray-600">
            Find the best mortgage rates from leading Canadian banks
          </p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-4">⚖️</div>
          <h3 className="text-xl font-bold mb-2">Find Lawyers</h3>
          <p className="text-gray-600">
            Connect with verified real estate lawyers in your area
          </p>
        </div>
      </div>
    </div>
  )
}

