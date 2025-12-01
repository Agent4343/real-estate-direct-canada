'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { propertiesAPI } from '@/lib/api'
import PropertyCard from '@/components/property/PropertyCard'
import SearchFilters from '@/components/property/SearchFilters'

export default function PropertiesPage() {
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
    fetchProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

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
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Browse Properties</h1>
        <Link
          href="/properties/new"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + List Your Property
        </Link>
      </div>

      {/* Search Filters */}
      <SearchFilters filters={filters} setFilters={setFilters} />

      {/* Properties Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
            <p className="ml-4 text-lg">Loading properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">No properties found matching your criteria.</p>
            <Link
              href="/properties/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Be the first to list a property
            </Link>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">Found {properties.length} property{properties.length !== 1 ? 'ies' : ''}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

