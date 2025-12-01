'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import { transactionsAPI } from '@/lib/api'

export default function TransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
      if (params.id) {
        fetchTransaction()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, params.id])

  const fetchTransaction = async () => {
    try {
      setLoading(true)
      const response = await transactionsAPI.getById(params.id)
      setTransaction(response.data.transaction)
    } catch (err) {
      setError('Transaction not found')
      console.error('Error fetching transaction:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDate = (date) => {
    if (!date || !mounted) return 'N/A'
    try {
      return new Date(date).toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return 'N/A'
    }
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
          <p className="ml-4 text-lg">Loading transaction...</p>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">{error || 'Transaction not found'}</p>
          <Link
            href="/transactions"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Transactions
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/transactions" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Transactions
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transaction Details</h1>
            <p className="text-gray-600">
              {transaction.transactionType} - {transaction.propertyId?.title || 'Property'}
            </p>
          </div>
          <span className={`px-4 py-2 rounded text-sm font-semibold ${getStatusColor(transaction.status)}`}>
            {transaction.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Financial Details</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Offer Price:</span>
                <span className="font-semibold">{formatPrice(transaction.offerPrice)}</span>
              </div>
              {transaction.finalPrice && (
                <div className="flex justify-between">
                  <span>Final Price:</span>
                  <span className="font-semibold">{formatPrice(transaction.finalPrice)}</span>
                </div>
              )}
              {transaction.depositAmount && (
                <div className="flex justify-between">
                  <span>Deposit:</span>
                  <span className="font-semibold">{formatPrice(transaction.depositAmount)}</span>
                </div>
              )}
              {transaction.platformFees?.successFee && (
                <div className="flex justify-between">
                  <span>Platform Fee:</span>
                  <span className="font-semibold">{formatPrice(transaction.platformFees.successFee)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Timeline</h3>
            <div className="space-y-2 text-gray-700">
              <div>
                <span className="text-sm text-gray-500">Offer Date:</span>
                <p className="font-semibold">{formatDate(transaction.offerDate)}</p>
              </div>
              {transaction.acceptanceDate && (
                <div>
                  <span className="text-sm text-gray-500">Accepted:</span>
                  <p className="font-semibold">{formatDate(transaction.acceptanceDate)}</p>
                </div>
              )}
              {transaction.closingDate && (
                <div>
                  <span className="text-sm text-gray-500">Closing Date:</span>
                  <p className="font-semibold">{formatDate(transaction.closingDate)}</p>
                </div>
              )}
              {transaction.completionDate && (
                <div>
                  <span className="text-sm text-gray-500">Completed:</span>
                  <p className="font-semibold">{formatDate(transaction.completionDate)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {transaction.conditions && transaction.conditions.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Conditions</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {transaction.conditions.map((condition, index) => (
                <li key={index}>
                  {condition.type}: {condition.description || condition}
                  {condition.status && (
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${getStatusColor(condition.status)}`}>
                      {condition.status}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {transaction.conditionsText && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Additional Conditions</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{transaction.conditionsText}</p>
          </div>
        )}

        <div className="border-t pt-6">
          <Link
            href={`/properties/${transaction.propertyId?._id || transaction.propertyId}`}
            className="text-blue-600 hover:underline"
          >
            View Property →
          </Link>
        </div>
      </div>
    </div>
  )
}

