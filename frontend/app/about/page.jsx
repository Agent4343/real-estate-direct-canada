'use client'

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">About Real Estate Direct</h1>

      <div className="prose max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-gray-700 text-lg">
            Real Estate Direct is Canada's one-stop platform for buying and selling real estate. 
            We connect buyers and sellers directly, eliminating the need for real estate agents 
            and their high commissions.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">For Sellers</h3>
              <p className="text-gray-700">
                List your property directly on our platform. Set your price, upload photos, 
                and connect with serious buyers. Save thousands in realtor commissions.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">For Buyers</h3>
              <p className="text-gray-700">
                Browse properties across all Canadian provinces. Make offers directly to sellers, 
                compare mortgage rates, and find qualified lawyers—all in one place.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Why Choose Us</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Save 75%+ compared to traditional realtor fees</li>
            <li>Direct communication between buyers and sellers</li>
            <li>Provincial compliance built-in for all 13 provinces/territories</li>
            <li>Integrated mortgage comparison tools</li>
            <li>Verified lawyer directory</li>
            <li>Secure document management</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Provincial Coverage</h2>
          <p className="text-gray-700">
            We support all 13 Canadian provinces and territories with province-specific 
            compliance rules, legal requirements, and regulatory guidance.
          </p>
        </section>
      </div>
    </div>
  )
}

