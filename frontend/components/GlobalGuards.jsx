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

    const existing = typeof window.calculateSavings === 'function' ? window.calculateSavings : null

    // Always provide a defensive wrapper so legacy scripts cannot crash
    // when their expected DOM nodes are missing.
    window.calculateSavings = (...args) => {
      const priceInput = document?.getElementById?.('price')
      const rateInput = document?.getElementById?.('commissionRate')

      const priceValue = priceInput?.value
      const rateValue = rateInput?.value

      if (!priceValue || !rateValue) {
        if (!existing) return null

        try {
          return existing(...args)
        } catch (err) {
          console.warn('calculateSavings skipped because inputs were missing', err)
          return null
        }
      }

      const price = Number(priceValue)
      const rate = Number(rateValue) / 100

      if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(rate) || rate < 0) {
        return null
      }

      // Prefer the legacy implementation when it exists, but fall back
      // to the simple calculation if it errors.
      if (existing) {
        try {
          return existing(...args)
        } catch (err) {
          console.warn('Legacy calculateSavings threw; falling back', err)
        }
      }

      return price * rate
    }

    return () => {
      if (existing) {
        window.calculateSavings = existing
      } else {
        delete window.calculateSavings
      }
    }
  }, [])

  return null
}
