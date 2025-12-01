'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUser, logout } from '@/lib/auth'

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUser(getUser())
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">🏠 RealEstateDirect</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/properties" className="text-gray-700 hover:text-blue-600 transition">
              Properties
            </Link>
            <Link href="/mortgages" className="text-gray-700 hover:text-blue-600 transition">
              Mortgages
            </Link>
            <Link href="/lawyers" className="text-gray-700 hover:text-blue-600 transition">
              Lawyers
            </Link>
            <Link href="/calculator" className="text-gray-700 hover:text-blue-600 transition">
              Calculator
            </Link>

            {mounted && user ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition">
                  Dashboard
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition">
                  Profile
                </Link>
                <Link href="/transactions" className="text-gray-700 hover:text-blue-600 transition">
                  Transactions
                </Link>
                <span className="text-gray-500">|</span>
                <span className="text-gray-700">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </>
            ) : mounted ? (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link href="/properties" className="block text-gray-700 hover:text-blue-600">Properties</Link>
            <Link href="/mortgages" className="block text-gray-700 hover:text-blue-600">Mortgages</Link>
            <Link href="/lawyers" className="block text-gray-700 hover:text-blue-600">Lawyers</Link>
            {mounted && user ? (
              <>
                <Link href="/dashboard" className="block text-gray-700 hover:text-blue-600">Dashboard</Link>
                <Link href="/profile" className="block text-gray-700 hover:text-blue-600">Profile</Link>
                <Link href="/transactions" className="block text-gray-700 hover:text-blue-600">Transactions</Link>
                <button onClick={handleLogout} className="block w-full text-left text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-700 hover:text-blue-600">Login</Link>
                <Link href="/register" className="block text-gray-700 hover:text-blue-600">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

