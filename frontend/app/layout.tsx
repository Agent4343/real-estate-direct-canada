import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import dynamic from 'next/dynamic'

// Import Footer as regular component (should be safe)
const Footer = dynamic(() => import('@/components/layout/Footer'), {
  ssr: true,
})

// Navbar must be client-side only due to localStorage access
const Navbar = dynamic(() => import('@/components/layout/NavbarWrapper'), {
  ssr: false,
  loading: () => (
    <nav className="bg-white shadow-lg" suppressHydrationWarning>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <span className="text-2xl font-bold text-blue-600">🏠 RealEstateDirect</span>
          <div className="hidden md:flex items-center space-x-6">
            <a href="/properties" className="text-gray-700 hover:text-blue-600 transition">Properties</a>
            <a href="/mortgages" className="text-gray-700 hover:text-blue-600 transition">Mortgages</a>
            <a href="/lawyers" className="text-gray-700 hover:text-blue-600 transition">Lawyers</a>
            <a href="/login" className="text-gray-700 hover:text-blue-600 transition">Login</a>
            <a href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Sign Up</a>
          </div>
        </div>
      </div>
    </nav>
  )
})

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Real Estate Direct - Buy & Sell Real Estate in Canada',
  description: 'One-stop shop for buying and selling real estate in Canada. Direct transactions, mortgage comparison, and lawyer directory.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <div suppressHydrationWarning>
          <Navbar />
          <main className="min-h-screen" suppressHydrationWarning>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}

