'use client'

import { useEffect } from 'react'

/**
 * Lightweight client guards that patch legacy globals used by static scripts.
 * This prevents runtime errors when the legacy savings calculator runs
 * without its expected DOM elements on the page.
 */
export default function GlobalGuards() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    // Only provide a fallback if no calculator exists yet.
    const existing = window.calculateSavings

    if (typeof existing !== 'function') {
      window.calculateSavings = () => {
        const priceInput = document?.getElementById?.('price')
        const rateInput = document?.getElementById?.('commissionRate')

        const priceValue = priceInput?.value
        const rateValue = rateInput?.value

        if (!priceValue || !rateValue) return null

        const price = Number(priceValue)
        const rate = Number(rateValue) / 100

        if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(rate) || rate < 0) {
          return null
        }

        return price * rate
      }
    }

    return () => {
      if (existing === undefined) {
        delete window.calculateSavings
      }
    }
  }, [])

  return null
}
