'use client'

import { useMemo, useState } from 'react'

const COMMISSION_DEFAULT = 0.05

export default function SavingsCalculator() {
  const [price, setPrice] = useState('')
  const [commissionRate, setCommissionRate] = useState(String(COMMISSION_DEFAULT * 100))
  const [error, setError] = useState('')

  const parsedPrice = useMemo(() => parseFloat(price), [price])
  const parsedCommission = useMemo(() => parseFloat(commissionRate) / 100, [commissionRate])

  const savings = useMemo(() => {
    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedCommission)) {
      return null
    }
    if (parsedPrice <= 0 || parsedCommission < 0) {
      return null
    }
    return parsedPrice * parsedCommission
  }, [parsedCommission, parsedPrice])

  const handleBlur = () => {
    if (!price || Number.isNaN(parsedPrice)) {
      setError('Enter a property price to estimate your savings.')
      return
    }

    if (parsedPrice <= 0) {
      setError('Price must be greater than zero.')
      return
    }

    if (commissionRate && Number.isNaN(parsedCommission)) {
      setError('Commission rate must be a valid number.')
      return
    }

    setError('')
  }

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-4">Savings Calculator</h2>
      <p className="text-gray-600 mb-6">
        Estimate how much you save by listing directly instead of paying a typical agent commission.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Price (CAD) *
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={handleBlur}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. 650000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Typical Commission (%)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            onBlur={handleBlur}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={(COMMISSION_DEFAULT * 100).toFixed(1)}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {savings !== null && !error && (
          <div className="bg-blue-50 border border-blue-100 text-blue-900 px-4 py-3 rounded">
            <p className="font-semibold">Potential savings:</p>
            <p className="text-2xl font-bold">
              {new Intl.NumberFormat('en-CA', {
                style: 'currency',
                currency: 'CAD',
                maximumFractionDigits: 0,
              }).format(savings)}
            </p>
            <p className="text-sm text-blue-800 mt-2">
              Based on a {commissionRate || (COMMISSION_DEFAULT * 100).toFixed(1)}% commission rate.
            </p>
          </div>
        )}

        {!savings && !error && (
          <p className="text-sm text-gray-500">
            Enter a property price to see how much you could save.
          </p>
        )}
      </div>
    </div>
  )
}

