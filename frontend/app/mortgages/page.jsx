'use client'

import { useState, useEffect } from 'react'
import { mortgagesAPI } from '@/lib/api'

export default function MortgagesPage() {
  const [mortgages, setMortgages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProvince, setSelectedProvince] = useState('ON')
  const [bestOffers, setBestOffers] = useState([])
  const [bestLoading, setBestLoading] = useState(false)
  const [loanAmount, setLoanAmount] = useState('')
  const [downPayment, setDownPayment] = useState('')
  const [termYears, setTermYears] = useState('5')

  useEffect(() => {
    fetchMortgages()
    fetchBestOffers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince])

  const fetchMortgages = async () => {
    try {
      setLoading(true)
      const response = await mortgagesAPI.getByProvince(selectedProvince)
      setMortgages(response.data.mortgages || [])
    } catch (error) {
      console.error('Error fetching mortgages:', error)
      setMortgages([])
    } finally {
      setLoading(false)
    }
  }

  const fetchBestOffers = async () => {
    try {
      setBestLoading(true)
      const filters = {}
      if (loanAmount) {
        filters.loanAmount = Number(loanAmount)
      }
      if (downPayment) {
        filters.downPayment = Number(downPayment)
      }
      if (termYears) {
        filters.term = Number(termYears) * 12
      }
      const response = await mortgagesAPI.getBest(selectedProvince, filters)
      setBestOffers(response.data.mortgages || [])
    } catch (error) {
      console.error('Error fetching best mortgage offers:', error)
      setBestOffers([])
    } finally {
      setBestLoading(false)
    }
  }

  const formatTermLabel = (mortgage) => {
    if (!mortgage) return 'N/A'
    const termYears = mortgage.termYears ?? (mortgage.term ? mortgage.term / 12 : null)
    if (!termYears) {
      return 'N/A'
    }
    const numericYears = Number(termYears)
    const formatted = Number.isFinite(numericYears)
      ? Number.isInteger(numericYears)
        ? numericYears
        : numericYears.toFixed(1)
      : termYears
    return `${formatted} years`
  }

  const getMortgageType = (mortgage) => mortgage?.mortgageType || mortgage?.type || 'N/A'

  const provinces = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
  const hasBestOffers = bestOffers.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Mortgage Comparison</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Province
        </label>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
        >
          {provinces.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Find Best Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loan Amount (CAD)</label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              placeholder="400000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment (CAD)</label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              placeholder="80000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Term (years)</label>
            <input
              type="number"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={termYears}
              onChange={(e) => setTermYears(e.target.value)}
              placeholder="5"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchBestOffers}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={bestLoading}
            >
              {bestLoading ? 'Searching...' : 'Find Best Offers'}
            </button>
          </div>
        </div>
        {bestLoading ? (
          <p className="text-gray-500 mt-4">Loading best offers...</p>
        ) : hasBestOffers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {bestOffers.map((offer) => (
              <div key={offer._id} className="border rounded-lg p-5 shadow-sm">
                <h3 className="text-xl font-bold mb-2">{offer.bankName}</h3>
                <p className="text-2xl font-bold text-green-600 mb-2">{offer.interestRate}% APR</p>
                <p className="text-gray-700 mb-1">Term: {formatTermLabel(offer)}</p>
                <p className="text-gray-700 mb-1">Type: {getMortgageType(offer)}</p>
                {offer.minDownPayment !== undefined && (
                  <p className="text-gray-700 mb-1">Min Down Payment: {offer.minDownPayment}%</p>
                )}
                {offer.maxLoanAmount && (
                  <p className="text-gray-700 mb-1">
                    Max Loan: {new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(offer.maxLoanAmount)}
                  </p>
                )}
                {offer.features && offer.features.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">Features: {offer.features.slice(0, 3).join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mt-4">No best-offer matches yet. Try adjusting your loan details.</p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="spinner"></div>
          <p className="ml-4 text-lg">Loading mortgage options...</p>
        </div>
      ) : mortgages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No mortgage options found for {selectedProvince}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mortgages.map((mortgage) => (
            <div key={mortgage._id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">{mortgage.bankName}</h3>
              <div className="space-y-2">
                <p className="text-2xl font-bold text-green-600">
                  {mortgage.interestRate}% APR
                </p>
                <p className="text-gray-600">Term: {formatTermLabel(mortgage)}</p>
                <p className="text-gray-600">Type: {getMortgageType(mortgage)}</p>
                {mortgage.minCreditScore && (
                  <p className="text-gray-600">Min Credit Score: {mortgage.minCreditScore}</p>
                )}
                {mortgage.website && (
                  <a
                    href={mortgage.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Visit Website →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

