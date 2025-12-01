'use client'

import { useState, useEffect } from 'react'
import { lawyersAPI } from '@/lib/api'

export default function LawyersPage() {
  const [lawyers, setLawyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedProvince, setSelectedProvince] = useState('ON')

  useEffect(() => {
    fetchLawyers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProvince])

  const fetchLawyers = async () => {
    try {
      setLoading(true)
      const response = await lawyersAPI.getByProvince(selectedProvince)
      setLawyers(response.data.lawyers || [])
    } catch (error) {
      console.error('Error fetching lawyers:', error)
      setLawyers([])
    } finally {
      setLoading(false)
    }
  }

  const provinces = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Find a Real Estate Lawyer</h1>

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
          <p className="ml-4 text-lg">Loading lawyers...</p>
        </div>
      ) : lawyers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No lawyers found for {selectedProvince}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {lawyers.map((lawyer) => (
            <div key={lawyer._id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold mb-2">{lawyer.name}</h3>
              {lawyer.firm && <p className="text-gray-600 mb-2">{lawyer.firm}</p>}
              <div className="space-y-2">
                {lawyer.address && (
                  <p className="text-gray-600">
                    {lawyer.address.street}, {lawyer.city}, {lawyer.province}
                  </p>
                )}
                {lawyer.phone && (
                  <p className="text-gray-600">Phone: {lawyer.phone}</p>
                )}
                {lawyer.email && (
                  <p className="text-gray-600">Email: {lawyer.email}</p>
                )}
                {lawyer.yearsExperience && (
                  <p className="text-gray-600">
                    Experience: {lawyer.yearsExperience} years
                  </p>
                )}
                {lawyer.rating && (
                  <p className="text-gray-600">
                    Rating: {lawyer.rating.average} / 5.0
                  </p>
                )}
                {lawyer.website && (
                  <a
                    href={lawyer.website}
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

