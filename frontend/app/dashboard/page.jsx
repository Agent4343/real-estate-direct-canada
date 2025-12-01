'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { propertiesAPI, transactionsAPI, favoritesAPI, notificationsAPI } from '@/lib/api'
import AcceptOfferButton from '@/components/dashboard/AcceptOfferButton'
import RejectOfferButton from '@/components/dashboard/RejectOfferButton'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Data states
  const [myProperties, setMyProperties] = useState([])
  const [myOffers, setMyOffers] = useState([])
  const [myListings, setMyListings] = useState([])
  const [favorites, setFavorites] = useState([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    setUser(currentUser)
    setLoading(false)
  }, [router])

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      // Load user's properties
      try {
        const propsResponse = await propertiesAPI.getAll({})
        const allProperties = propsResponse.data.properties || []
        const userProps = allProperties.filter(p => {
          const sellerId = p.sellerId?._id || p.sellerId
          return sellerId && sellerId.toString() === user._id.toString()
        })
        setMyProperties(userProps)
      } catch (err) {
        console.error('Error loading properties:', err)
      }
      
      // Load transactions
      try {
        const offersResponse = await transactionsAPI.getMyOffers()
        setMyOffers(offersResponse.data.offers || [])
        
        const listingsResponse = await transactionsAPI.getMyListings()
        setMyListings(listingsResponse.data.offers || [])
      } catch (err) {
        console.error('Error loading transactions:', err)
      }
      
      // Load favorites
      try {
        const favsResponse = await favoritesAPI.getAll()
        setFavorites(favsResponse.data.favorites || [])
      } catch (err) {
        console.error('Error loading favorites:', err)
      }
      
      // Load notifications
      try {
        const notifResponse = await notificationsAPI.getUnreadCount()
        setUnreadNotifications(notifResponse.data.unreadCount || 0)
      } catch (err) {
        console.error('Error loading notifications:', err)
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user.firstName || user.name || 'User'}!
              </h1>
              <p className="text-gray-600 mt-1">
                {user.email} • {user.province || ''}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/properties/new"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + List Property
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-600 text-sm mb-1">My Properties</div>
            <div className="text-3xl font-bold text-blue-600">{myProperties.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-600 text-sm mb-1">My Offers</div>
            <div className="text-3xl font-bold text-green-600">{myOffers.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-600 text-sm mb-1">Incoming Offers</div>
            <div className="text-3xl font-bold text-orange-600">{myListings.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-gray-600 text-sm mb-1">Favorites</div>
            <div className="text-3xl font-bold text-red-600">{favorites.length}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Properties ({myProperties.length})
              </button>
              <button
                onClick={() => setActiveTab('offers')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'offers'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                My Offers ({myOffers.length})
              </button>
              <button
                onClick={() => setActiveTab('listings')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'listings'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Incoming Offers ({myListings.length})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-6 py-4 font-medium text-sm ${
                  activeTab === 'favorites'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Favorites ({favorites.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
                  <div className="space-y-4">
                    {myListings.length > 0 && (
                      <div className="border-l-4 border-orange-500 pl-4">
                        <p className="font-semibold">You have {myListings.length} new offer(s) on your properties</p>
                        <button
                          onClick={() => setActiveTab('listings')}
                          className="text-blue-600 hover:underline"
                        >
                          View offers →
                        </button>
                      </div>
                    )}
                    {myProperties.length === 0 && (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-600 mb-4">You haven't listed any properties yet</p>
                        <Link
                          href="/properties/new"
                          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          List Your First Property
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link
                      href="/properties/new"
                      className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition text-center"
                    >
                      <div className="text-2xl mb-2">🏠</div>
                      <div className="font-semibold">List Property</div>
                    </Link>
                    <Link
                      href="/properties"
                      className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition text-center"
                    >
                      <div className="text-2xl mb-2">🔍</div>
                      <div className="font-semibold">Browse Properties</div>
                    </Link>
                    <Link
                      href="/mortgages"
                      className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition text-center"
                    >
                      <div className="text-2xl mb-2">💰</div>
                      <div className="font-semibold">Find Mortgage</div>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* My Properties Tab */}
            {activeTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">My Properties</h2>
                  <Link
                    href="/properties/new"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    + Add Property
                  </Link>
                </div>
                {myProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">You haven't listed any properties yet</p>
                    <Link
                      href="/properties/new"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      List Your First Property
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myProperties.map((property) => (
                      <div key={property._id} className="border rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/properties/${property._id}`} className="text-xl font-bold text-blue-600 hover:underline">
                              {property.title}
                            </Link>
                            <p className="text-gray-600">{property.city}, {property.province}</p>
                            <p className="text-2xl font-bold text-green-600 mt-2">{formatPrice(property.price)}</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                              property.status === 'Active' ? 'bg-green-100 text-green-800' :
                              property.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {property.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              href={`/properties/${property._id}/edit`}
                              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
                            >
                              Edit
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* My Offers Tab */}
            {activeTab === 'offers' && (
              <div>
                <h2 className="text-xl font-bold mb-4">My Offers</h2>
                {myOffers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">You haven't made any offers yet</p>
                    <Link
                      href="/properties"
                      className="mt-4 inline-block text-blue-600 hover:underline"
                    >
                      Browse properties →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myOffers.map((offer) => (
                      <div key={offer._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/properties/${offer.propertyId?._id || offer.propertyId}`} className="text-xl font-bold text-blue-600 hover:underline">
                              {offer.propertyId?.title || 'Property'}
                            </Link>
                            <p className="text-gray-600">{offer.propertyId?.city}, {offer.propertyId?.province}</p>
                            <p className="text-2xl font-bold mt-2">{formatPrice(offer.offerPrice)}</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                              offer.status === 'Offer Accepted' ? 'bg-green-100 text-green-800' :
                              offer.status === 'Offer Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {offer.status}
                            </span>
                          </div>
                          <Link
                            href={`/transactions/${offer._id}`}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Incoming Offers Tab */}
            {activeTab === 'listings' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Incoming Offers</h2>
                {myListings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No offers on your properties yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myListings.map((offer) => (
                      <div key={offer._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link href={`/properties/${offer.propertyId?._id || offer.propertyId}`} className="text-xl font-bold text-blue-600 hover:underline">
                              {offer.propertyId?.title || 'Property'}
                            </Link>
                            <p className="text-gray-600">Offer from: {offer.buyerId?.name || offer.buyerId?.email || 'Buyer'}</p>
                            <p className="text-2xl font-bold mt-2">{formatPrice(offer.offerPrice)}</p>
                            <span className={`inline-block mt-2 px-3 py-1 rounded text-sm ${
                              offer.status === 'Offer Accepted' ? 'bg-green-100 text-green-800' :
                              offer.status === 'Offer Rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {offer.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {offer.status === 'Offer Made' && (
                              <div className="flex gap-2">
                                <AcceptOfferButton transactionId={offer._id} />
                                <RejectOfferButton transactionId={offer._id} />
                              </div>
                            )}
                            <Link
                              href={`/transactions/${offer._id}`}
                              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Favorites Tab */}
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Favorite Properties</h2>
                {favorites.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">You haven't favorited any properties yet</p>
                    <Link
                      href="/properties"
                      className="mt-4 inline-block text-blue-600 hover:underline"
                    >
                      Browse properties →
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((fav) => (
                      <Link
                        key={fav._id}
                        href={`/properties/${fav.propertyId?._id || fav.propertyId}`}
                        className="border rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="text-xl font-bold">{fav.propertyId?.title || 'Property'}</div>
                        <p className="text-gray-600">{fav.propertyId?.city}, {fav.propertyId?.province}</p>
                        <p className="text-xl font-bold text-blue-600 mt-2">{formatPrice(fav.propertyId?.price)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
