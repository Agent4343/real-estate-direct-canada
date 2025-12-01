'use client'

import { useState } from 'react'
import { mortgageCalculatorAPI } from '@/lib/api'

export default function CalculatorPage() {
  const [formData, setFormData] = useState({
    principal: '',
    interestRate: '',
    term: '25',
    amortizationPeriod: '25',
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleCalculate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        principal: parseFloat(formData.principal),
        interestRate: parseFloat(formData.interestRate),
        term: parseInt(formData.term),
        amortizationPeriod: parseInt(formData.amortizationPeriod),
      }
      const response = await mortgageCalculatorAPI.calculatePayment(data)
      setResult(response.data)
    } catch (error) {
      console.error('Error calculating:', error)
      alert('Error calculating mortgage. Please check your inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-4xl font-bold mb-8">Mortgage Calculator</h1>

      <div className="bg-white shadow-lg rounded-lg p-8">
        <form onSubmit={handleCalculate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Principal Amount (CAD) *
            </label>
            <input
              type="number"
              required
              min="0"
              step="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.principal}
              onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interest Rate (%) *
            </label>
            <input
              type="number"
              required
              min="0"
              max="100"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={formData.interestRate}
              onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Term (years) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amortization Period (years) *
              </label>
              <input
                type="number"
                required
                min="1"
                max="30"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={formData.amortizationPeriod}
                onChange={(e) => setFormData({ ...formData, amortizationPeriod: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {loading ? 'Calculating...' : 'Calculate Payment'}
          </button>
        </form>

        {result && (
          <div className="mt-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Calculation Results</h2>
            <div className="space-y-2">
              <p className="text-lg">
                <span className="font-semibold">Monthly Payment:</span>{' '}
                {new Intl.NumberFormat('en-CA', {
                  style: 'currency',
                  currency: 'CAD',
                }).format(result.monthlyPayment)}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Total Interest:</span>{' '}
                {new Intl.NumberFormat('en-CA', {
                  style: 'currency',
                  currency: 'CAD',
                }).format(result.totalInterest)}
              </p>
              <p className="text-lg">
                <span className="font-semibold">Total Payment:</span>{' '}
                {new Intl.NumberFormat('en-CA', {
                  style: 'currency',
                  currency: 'CAD',
                }).format(result.totalPayment)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

