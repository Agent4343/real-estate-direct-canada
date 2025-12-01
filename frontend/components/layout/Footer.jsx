'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16" suppressHydrationWarning>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">RealEstateDirect</h3>
            <p className="text-gray-400">
              Buy and sell real estate directly without realtors. Save thousands on fees.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Buyers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/properties" className="hover:text-white">Browse Properties</Link></li>
              <li><Link href="/mortgages" className="hover:text-white">Find Mortgages</Link></li>
              <li><Link href="/lawyers" className="hover:text-white">Find Lawyers</Link></li>
              <li><Link href="/calculator" className="hover:text-white">Mortgage Calculator</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">For Sellers</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/properties/new" className="hover:text-white">List Property</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">My Dashboard</Link></li>
              <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/legal/terms" className="hover:text-white">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Real Estate Direct. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

