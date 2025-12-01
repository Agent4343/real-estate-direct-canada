'use client'

import { useEffect, useState } from 'react'

export default function ClientWrapper({ children }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div suppressHydrationWarning>
        {/* Render empty div during SSR to prevent hydration mismatch */}
      </div>
    )
  }

  return <div suppressHydrationWarning>{children}</div>
}

