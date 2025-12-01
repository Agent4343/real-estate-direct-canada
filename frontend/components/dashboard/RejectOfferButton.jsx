'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { transactionsAPI } from '@/lib/api'

export default function RejectOfferButton({ transactionId }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this offer?')) return
    
    try {
      setLoading(true)
      await transactionsAPI.rejectOffer(transactionId, 'Rejected by seller')
      alert('Offer rejected')
      router.refresh()
    } catch (error) {
      alert(error.response?.data?.message || 'Error rejecting offer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleReject}
      disabled={loading}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
    >
      {loading ? 'Rejecting...' : 'Reject'}
    </button>
  )
}

