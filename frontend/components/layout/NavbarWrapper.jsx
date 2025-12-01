'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getUser, logout } from '@/lib/auth'

export default function NavbarWrapper() {
  const [user, setUser] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentUser = getUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  // During SSR and initial mount, show default (logged-out) state
  // This ensures server and client render the same initial HTML
  const showUserContent = mounted && user

  return (
    <nav className="bg-white shadow-lg" suppressHydrationWarning>
      <div className="container mx-auto px-4" suppressHydrationWarning>
        <div className="flex justify-between items-center h-16" suppressHydrationWarning>
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" suppressHydrationWarning>
            <span className="text-2xl font-bold text-blue-600" suppressHydrationWarning>🏠 RealEstateDirect</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6" suppressHydrationWarning>
            <Link href="/properties" className="text-gray-700 hover:text-blue-600 transition" suppressHydrationWarning>
              Properties
            </Link>
            <Link href="/mortgages" className="text-gray-700 hover:text-blue-600 transition" suppressHydrationWarning>
              Mortgages
            </Link>
            <Link href="/lawyers" className="text-gray-700 hover:text-blue-600 transition" suppressHydrationWarning>
              Lawyers
            </Link>
            <Link href="/calculator" className="text-gray-700 hover:text-blue-600 transition" suppressHydrationWarning>
              Calculator
            </Link>

            {showUserContent ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition" suppressHydrationWarning>
                  Dashboard
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600 transition" suppressHydrationWarning>
                  Profile
                </Link>
                <Link href="/transactions" className="text-gray-700 hover:text-blue-600 transition" suppressHydrationWarning>
                  Transactions
                </Link>
                <span className="text-gray-500" suppressHydrationWarning>|</span>
                <span className="text-gray-700" suppressHydrationWarning>{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  suppressHydrationWarning
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 transition"
                  suppressHydrationWarning
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                  suppressHydrationWarning
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
            suppressHydrationWarning
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2" suppressHydrationWarning>
            <Link href="/properties" className="block text-gray-700 hover:text-blue-600" suppressHydrationWarning>Properties</Link>
            <Link href="/mortgages" className="block text-gray-700 hover:text-blue-600" suppressHydrationWarning>Mortgages</Link>
            <Link href="/lawyers" className="block text-gray-700 hover:text-blue-600" suppressHydrationWarning>Lawyers</Link>
            {showUserContent ? (
              <>
                <Link href="/dashboard" className="block text-gray-700 hover:text-blue-600" suppressHydrationWarning>Dashboard</Link>
                <Link href="/profile" className="block text-gray-700 hover:text-blue-600" suppressHydrationWarning>Profile</Link>
                <Link href="/transactions" className="block text-gray-700 hover:text-blue-600" suppressHydrationWarning>Transactions</Link>
                <button onClick={handleLogout} className="block w-full text-left text-red-600" suppressHydrationWarning>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-gray-700 hover:text-blue-600" suppressHydrationWarning>Login</Link>
                <Link href="/register" className="block text-gray-700 hover:text-blue-600" suppressHydrationWarning>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

