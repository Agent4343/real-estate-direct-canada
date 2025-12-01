'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { propertiesAPI, favoritesAPI, transactionsAPI } from '@/lib/api'
import { getUser } from '@/lib/auth'
import MakeOfferModal from '@/components/property/MakeOfferModal'
import ImageGallery from '@/components/property/ImageGallery'

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchProperty()
    }
    const currentUser = getUser()
    setUser(currentUser)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  useEffect(() => {
    if (user && property) {
      checkFavorite()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, property])

  const fetchProperty = async () => {
    try {
      setLoading(true)
      const response = await propertiesAPI.getById(params.id)
      setProperty(response.data.property)
    } catch (err) {
      setError('Property not found')
      console.error('Error fetching property:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkFavorite = async () => {
    if (!user || !property) return
    try {
      const response = await favoritesAPI.check(property._id)
      setIsFavorite(response.data.isFavorite || false)
    } catch (err) {
      // Not favorited or error
      setIsFavorite(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setFavoriteLoading(true)
    try {
      if (isFavorite) {
        // Get favorite ID first
        const favoritesResponse = await favoritesAPI.getAll()
        const favorite = favoritesResponse.data.favorites?.find(
          f => f.propertyId?._id === property._id || f.propertyId === property._id
        )
        if (favorite) {
          await favoritesAPI.remove(favorite._id)
        }
        setIsFavorite(false)
      } else {
        await favoritesAPI.add(property._id)
        setIsFavorite(true)
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleMakeOffer = () => {
    if (!user) {
      router.push('/login')
      return
    }
    setShowOfferModal(true)
  }

  const handleOfferSuccess = () => {
    // Show success message or redirect
    alert('Offer submitted successfully! You will be notified when the seller responds.')
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
          <p className="ml-4 text-lg">Loading property...</p>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">{error || 'Property not found'}</p>
          <Link
            href="/properties"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Properties
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/properties" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Properties
      </Link>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Property Images */}
        <ImageGallery images={property.images || []} />

        {/* Property Details */}
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="text-gray-600 text-lg">
                {property.address?.street}, {property.city}, {property.province}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-600">{formatPrice(property.price)}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                property.status === 'Active' ? 'bg-green-100 text-green-800' :
                property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {property.status}
              </span>
            </div>
          </div>

          {/* Property Features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
            {property.bedrooms > 0 && (
              <div>
                <p className="text-gray-600 text-sm">Bedrooms</p>
                <p className="text-2xl font-bold">{property.bedrooms}</p>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div>
                <p className="text-gray-600 text-sm">Bathrooms</p>
                <p className="text-2xl font-bold">{property.bathrooms}</p>
              </div>
            )}
            {property.squareFootage && (
              <div>
                <p className="text-gray-600 text-sm">Square Feet</p>
                <p className="text-2xl font-bold">{property.squareFootage.toLocaleString()}</p>
              </div>
            )}
            {property.propertyType && (
              <div>
                <p className="text-gray-600 text-sm">Type</p>
                <p className="text-2xl font-bold">{property.propertyType}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {property.description && (
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{property.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            {property.status === 'Active' && (
              <button
                onClick={handleMakeOffer}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Make an Offer
              </button>
            )}
            <button
              onClick={handleToggleFavorite}
              disabled={favoriteLoading}
              className={`px-6 py-3 rounded-lg transition font-semibold ${
                isFavorite
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {favoriteLoading ? '...' : isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
            </button>
            <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition">
              Share Property
            </button>
          </div>
        </div>
      </div>

      {/* Make Offer Modal */}
      {property && (
        <MakeOfferModal
          property={property}
          isOpen={showOfferModal}
          onClose={() => setShowOfferModal(false)}
          onSuccess={handleOfferSuccess}
        />
      )}
    </div>
  )
}

