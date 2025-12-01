'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { transactionsAPI } from '@/lib/api'

export default function TransactionsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, active, completed, cancelled

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      const user = getUser()
      if (!user) {
        router.push('/login')
        return
      }
      loadTransactions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, filter])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const myOffersResponse = await transactionsAPI.getMyOffers()
      const myListingsResponse = await transactionsAPI.getMyListings()
      
      // Combine and filter
      let allTransactions = [
        ...(myOffersResponse.data.transactions || []).map(t => ({ ...t, type: 'offer' })),
        ...(myListingsResponse.data.transactions || []).map(t => ({ ...t, type: 'listing' }))
      ]

      // Apply filter
      if (filter !== 'all') {
        allTransactions = allTransactions.filter(t => {
          if (filter === 'active') {
            return ['Offer Made', 'Offer Accepted', 'Under Review', 'In Progress'].includes(t.status)
          }
          if (filter === 'completed') {
            return t.status === 'Completed'
          }
          if (filter === 'cancelled') {
            return ['Cancelled', 'Failed', 'Offer Rejected'].includes(t.status)
          }
          return true
        })
      }

      setTransactions(allTransactions)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Offer Accepted':
      case 'Under Review':
        return 'bg-blue-100 text-blue-800'
      case 'Cancelled':
      case 'Failed':
      case 'Offer Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (!mounted || loading) {
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Transactions</h1>
        <Link
          href="/properties"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Browse Properties
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        {['all', 'active', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-semibold capitalize border-b-2 transition ${
              filter === f
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {f === 'all' ? 'All Transactions' : f}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
          <p className="ml-4 text-lg">Loading transactions...</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No transactions found</p>
          <Link
            href="/properties"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <Link
              key={transaction._id}
              href={`/transactions/${transaction._id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-xl font-bold">
                      {transaction.type === 'offer' ? 'Offer Made' : 'Listing'}
                    </h3>
                    <span className={`px-3 py-1 rounded text-sm ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Property: {transaction.propertyId?.title || 'Property'}
                  </p>
                  <div className="flex gap-6 text-sm text-gray-600">
                    <span>Offer: {formatPrice(transaction.offerPrice)}</span>
                    {transaction.finalPrice && (
                      <span>Final: {formatPrice(transaction.finalPrice)}</span>
                    )}
                    {transaction.offerDate && mounted && (
                      <span>Date: {new Date(transaction.offerDate).toLocaleDateString('en-CA')}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(transaction.offerPrice || transaction.finalPrice)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

