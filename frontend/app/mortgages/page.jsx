'use client'

import { useState, useEffect } from 'react'
import { mortgagesAPI } from '@/lib/api'

export default function MortgagesPage() {
  const [mortgages, setMortgages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProvince, setSelectedProvince] = useState('ON')

  useEffect(() => {
    fetchMortgages()
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

  const provinces = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']

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
                <p className="text-gray-600">Term: {mortgage.term} years</p>
                <p className="text-gray-600">Type: {mortgage.type}</p>
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

