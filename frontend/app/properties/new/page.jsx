'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { propertiesAPI } from '@/lib/api'
import { getAuthToken, requireAuth } from '@/lib/auth'

export default function NewPropertyPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
    },
    price: '',
    propertyType: 'Residential',
    bedrooms: '',
    bathrooms: '',
    squareFootage: '',
    listingType: 'Sale',
    province: 'ON',
    postalCode: '',
  })

  useEffect(() => {
    setMounted(true)
    requireAuth(router)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const provinces = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
  const propertyTypes = ['Residential', 'Commercial', 'Land', 'Industrial', 'Mixed Use']
  const postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  const listingTypes = ['Sale', 'Rent']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const token = getAuthToken()
    if (!token) {
      setError('Please log in again before creating a listing.')
      setLoading(false)
      router.push('/login')
      return
    }

    if (!formData.address.street.trim()) {
      setError('Street address is required.')
      setLoading(false)
      return
    }

    if (!formData.city?.trim()) {
      setError('City is required.')
      setLoading(false)
      return
    }

    if (!provinces.includes(formData.province)) {
      setError('Please select a valid Canadian province/territory code.')
      setLoading(false)
      return
    }

    const trimmedTitle = formData.title.trim()
    const trimmedDescription = formData.description.trim()

    if (!trimmedTitle || !trimmedDescription) {
      setError('Title and description are required.')
      setLoading(false)
      return
    }

    if (trimmedTitle.length < 5) {
      setError('Please enter a descriptive title (at least 5 characters).')
      setLoading(false)
      return
    }

    if (trimmedDescription.length < 20) {
      setError('Description must be at least 20 characters to pass validation.')
      setLoading(false)
      return
    }

    if (!formData.price || Number(formData.price) <= 0 || Number.isNaN(Number(formData.price))) {
      setError('Price must be greater than zero.')
      setLoading(false)
      return
    }

    if (!propertyTypes.includes(formData.propertyType)) {
      setError('Please choose a valid property type.')
      setLoading(false)
      return
    }

    if (!listingTypes.includes(formData.listingType)) {
      setError('Please choose whether the property is for sale or rent.')
      setLoading(false)
      return
    }

    if (!formData.postalCode.trim()) {
      setError('Postal code is required.')
      setLoading(false)
      return
    }

    const normalizedPostal = formData.postalCode.trim().toUpperCase()

    if (!postalCodeRegex.test(normalizedPostal)) {
      setError('Enter a valid Canadian postal code (e.g., K1A 0B1).')
      setLoading(false)
      return
    }

    try {
      const submitData = {
        ...formData,
        title: trimmedTitle,
        description: trimmedDescription,
        province: formData.province.toUpperCase(),
        city: formData.city.trim(),
        price: parseFloat(formData.price),
        bedrooms: parseInt(formData.bedrooms) || 0,
        bathrooms: parseFloat(formData.bathrooms) || 0,
        squareFootage: parseInt(formData.squareFootage) || 0,
        postalCode: normalizedPostal,
        address: {
          ...formData.address,
          street: formData.address.street.trim(),
          city: formData.city?.trim() || formData.address.city,
          province: formData.province.toUpperCase(),
          postalCode: normalizedPostal,
        },
      }
      await propertiesAPI.create(submitData)
      router.push('/dashboard?tab=properties')
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Your session expired. Please log in again to publish your listing.')
        router.push('/login')
        return
      }

      const validationErrors = err.response?.data?.errors
        ?.map((e) => e.msg || e.message)
        .filter(Boolean)
        .join('; ')
      const message = validationErrors || err.response?.data?.message || err.response?.data?.error || err.message
      setError(message || 'Error creating property listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/properties" className="text-blue-600 hover:underline">
          ← Back to Properties
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">List Your Property</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Basic Information */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Title *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                required
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Listing Type *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.listingType}
                  onChange={(e) => setFormData({ ...formData, listingType: e.target.value })}
                >
                  <option value="Sale">For Sale</option>
                  <option value="Rent">For Rent</option>
                </select>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Type *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                      city: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Province *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      province: e.target.value,
                      address: { ...formData.address, province: e.target.value },
                    })
                  }
                >
                  {provinces.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.postalCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    postalCode: e.target.value,
                    address: { ...formData.address, postalCode: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Property Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (CAD) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Square Footage
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.squareFootage}
                onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bedrooms
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bathrooms
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link
            href="/properties"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  )
}

