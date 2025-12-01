'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { transactionsAPI } from '@/lib/api'

export default function AcceptOfferButton({ transactionId }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAccept = async () => {
    if (!confirm('Are you sure you want to accept this offer?')) return
    
    try {
      setLoading(true)
      await transactionsAPI.acceptOffer(transactionId)
      alert('Offer accepted successfully!')
      router.refresh()
    } catch (error) {
      alert(error.response?.data?.message || 'Error accepting offer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50"
    >
      {loading ? 'Accepting...' : 'Accept'}
    </button>
  )
}

