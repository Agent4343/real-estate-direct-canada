import Link from 'next/link'

const buyingSteps = [
  {
    title: 'Step 1: Get pre-approved',
    summary: 'Know your maximum budget and signal to sellers you can close.',
    tasks: [
      'Gather pay stubs, T4s/NOA, and a letter of employment',
      'Let your lender pull credit and verify your down payment',
      'Ask for a written pre-approval letter with your rate hold',
    ],
    badge: '3/6 tasks done',
  },
  {
    title: 'Step 2: Search & shortlist',
    summary: 'Filter by must-haves vs. nice-to-haves so you only tour real fits.',
    tasks: [
      'Define location, property type, beds/baths, and commute needs',
      'Visit neighbourhoods at different times of day',
      'Set property alerts so you are first to new listings',
    ],
    badge: '0/6 tasks done',
  },
  {
    title: 'Step 3: Make an offer',
    summary: 'Submit the right price, deposit, dates, and protective conditions.',
    tasks: [
      'Confirm offer price, 3–5% deposit funds, and closing date',
      'Include financing, inspection, and lawyer-review conditions',
      'List chattels/fixtures so there are no surprises at possession',
    ],
    badge: '0/7 tasks done',
  },
  {
    title: 'Step 4: Conditions period',
    summary: 'Use the window to finish financing and review the home and contract.',
    tasks: [
      'Finalize mortgage approval with your lender',
      'Schedule and review the home inspection',
      'Have your lawyer review the agreement before waiving',
    ],
    badge: '0/10 tasks done',
  },
  {
    title: 'Step 5: Close the deal',
    summary: 'Sign, fund, and move with no last-minute surprises.',
    tasks: [
      'Send remaining down payment to your lawyer’s trust account',
      'Arrange home insurance and transfer utilities',
      'Do a final walkthrough before keys are released',
    ],
    badge: '0/10 tasks done',
  },
]

const sellingSteps = [
  {
    title: 'Step 1: Prep to list',
    summary: 'Tidy, declutter, and repair the small things buyers notice.',
    tasks: [
      'Deep clean, declutter, and fix obvious repairs',
      'Gather utility bills, permits, and recent upgrades',
      'Take bright, well-framed photos or hire a photographer',
    ],
  },
  {
    title: 'Step 2: Price & paperwork',
    summary: 'Set a competitive price and complete the provincial forms.',
    tasks: [
      'Research comparable sales to anchor your list price',
      'Confirm required disclosures and forms for your province',
      'Prepare feature sheets and highlight improvements',
    ],
  },
  {
    title: 'Step 3: Launch the listing',
    summary: 'Publish, promote, and keep showings easy to book.',
    tasks: [
      'List on Real Estate Direct and share to your channels',
      'Keep showing times flexible and the home showing-ready',
      'Respond to inquiries quickly to maintain momentum',
    ],
  },
  {
    title: 'Step 4: Review offers',
    summary: 'Compare more than price—check deposits, dates, and conditions.',
    tasks: [
      'Check deposit size, conditions, and buyer financing timelines',
      'Confirm proposed closing date works with your plans',
      'Ask your lawyer to review before accepting',
    ],
  },
  {
    title: 'Step 5: Close & hand off',
    summary: 'Complete paperwork, plan your move, and hand over keys.',
    tasks: [
      'Sign closing documents and confirm payout details with your lawyer',
      'Schedule movers and utility cancellations/transfer',
      'Leave manuals, keys, and codes for the buyer on possession day',
    ],
  },
]

const buyerChecklist = [
  {
    title: 'Pre-approval kit',
    items: [
      'Proof of income (pay stubs, T4s/NOA)',
      'Employment letter',
      'Credit check authorization',
      'Down payment proof (bank statements)',
      'Government ID',
    ],
  },
  {
    title: 'Offer ingredients',
    items: [
      'Offer price + deposit (3–5% typical)',
      'Closing date and irrevocable deadline',
      'Conditions: financing (≈5 business days), inspection (≈7), lawyer review (≈3)',
      'Chattels & fixtures list',
    ],
  },
  {
    title: 'Conditions period to-dos',
    items: [
      'Finalize mortgage with lender',
      'Book and review inspection',
      'Have lawyer review all documents',
      'Arrange home insurance and utilities',
    ],
  },
]

const closingCosts = [
  { label: 'Land transfer tax', detail: 'Varies by province — use our calculator to estimate' },
  { label: 'Legal fees', detail: '$1,000 – $2,500 typical range' },
  { label: 'Title insurance', detail: '$300 – $500' },
  { label: 'Home inspection', detail: '$400 – $700' },
  { label: 'Adjustments', detail: 'Property tax, utilities, condo fees, etc.' },
]

const sellingChecklist = [
  {
    title: 'Before you list',
    items: [
      'Declutter, deep clean, and handle quick repairs',
      'Collect utility bills, permits, and warranties',
      'Stage key rooms and capture bright photos',
    ],
  },
  {
    title: 'During showings',
    items: [
      'Keep the home tidy and smelling fresh',
      'Offer flexible viewing times and easy access',
      'Have feature sheets ready with upgrades and inclusions',
    ],
  },
  {
    title: 'When offers arrive',
    items: [
      'Compare price, deposit strength, and conditions',
      'Confirm closing date fits your move',
      'Have your lawyer review before accepting',
    ],
  },
]

const DownPaymentTable = () => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-lg font-semibold">Down payment rules (Canada)</h3>
      <span className="text-sm text-gray-500">Quick reference</span>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="font-semibold">Under $500K</p>
        <p className="text-gray-700">5% minimum</p>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="font-semibold">$500K – $999,999</p>
        <p className="text-gray-700">5% of first $500K + 10% of the rest</p>
      </div>
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
        <p className="font-semibold">$1M and above</p>
        <p className="text-gray-700">20% minimum</p>
      </div>
    </div>
    <p className="text-sm text-gray-600 mt-3">
      If your down payment is below 20%, you will need CMHC mortgage insurance, which increases your monthly cost.
    </p>
  </div>
)

const ActionShortcuts = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Link
      href="/properties"
      className="block bg-blue-600 text-white rounded-lg p-4 shadow hover:bg-blue-700 transition"
    >
      <p className="text-sm uppercase tracking-wide text-blue-50">Search</p>
      <h3 className="text-xl font-semibold">Browse properties</h3>
      <p className="text-sm text-blue-50 mt-1">Set alerts and be first to know about new listings.</p>
    </Link>
    <Link
      href="/properties/new"
      className="block bg-white border rounded-lg p-4 shadow hover:shadow-md transition"
    >
      <p className="text-sm uppercase tracking-wide text-gray-500">Sell</p>
      <h3 className="text-xl font-semibold">List your property</h3>
      <p className="text-sm text-gray-600 mt-1">Create a compliant listing with photos, price, and disclosures.</p>
    </Link>
    <Link
      href="/calculator"
      className="block bg-white border rounded-lg p-4 shadow hover:shadow-md transition"
    >
      <p className="text-sm uppercase tracking-wide text-gray-500">Calculate</p>
      <h3 className="text-xl font-semibold">Mortgage & closing costs</h3>
      <p className="text-sm text-gray-600 mt-1">Estimate payments and land transfer tax before you offer.</p>
    </Link>
  </div>
)

const StepCard = ({ step, badge }) => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-semibold">{step.title}</h3>
      {badge && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{badge}</span>}
    </div>
    <p className="text-gray-700 text-sm mb-3">{step.summary}</p>
    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
      {step.tasks.map((task) => (
        <li key={task}>{task}</li>
      ))}
    </ul>
  </div>
)

const SimpleChecklist = ({ title, items }) => (
  <div className="bg-white border rounded-lg p-4 shadow-sm">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)

export default function GuidesPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 mb-8 shadow-lg">
        <p className="text-sm uppercase tracking-wide text-blue-100">Your Home Buying Checklist</p>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl font-bold">Know exactly what to do next</h1>
            <p className="text-blue-100 mt-1">
              Clear, plain-language steps for buying or selling so you always know what happens next.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-lg p-4">
            <p className="text-sm text-blue-100">Progress example</p>
            <p className="text-2xl font-bold">3 of 39 tasks complete</p>
            <p className="text-sm text-blue-100">8% done — pick up at Step 2 to stay on track</p>
            <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-2 bg-white rounded-full" style={{ width: '8%' }} aria-label="8% complete" />
            </div>
            <button className="mt-3 text-sm font-semibold underline">Reset progress</button>
          </div>
        </div>
      </div>

      <ActionShortcuts />

      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Buying roadmap</h2>
            <span className="text-sm text-gray-600">5 steps with exact tasks</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {buyingSteps.map((step) => (
              <StepCard key={step.title} step={step} badge={step.badge} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Seller game plan</h2>
            <span className="text-sm text-gray-600">From prep to keys handed over</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {sellingSteps.map((step) => (
              <StepCard key={step.title} step={step} />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
        {buyerChecklist.map((list) => (
          <SimpleChecklist key={list.title} title={list.title} items={list.items} />
        ))}
      </section>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <DownPaymentTable />
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Conditions keep you safe</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
            <li><strong>Financing:</strong> ~5 business days to secure final lender approval.</li>
            <li><strong>Inspection:</strong> ~7 days for a professional inspection and report.</li>
            <li><strong>Lawyer review:</strong> ~3 days for contract review and title checks.</li>
            <li><strong>Sale of property:</strong> If you need to sell before buying.</li>
          </ul>
          <p className="text-sm text-gray-600 mt-3">
            Tip: An offer is binding once conditions are waived. Keep the timelines realistic so you do not have to back out.
          </p>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Closing costs to budget for</h3>
          <ul className="divide-y text-sm text-gray-700">
            {closingCosts.map((cost) => (
              <li key={cost.label} className="py-2 flex justify-between items-start gap-3">
                <span className="font-semibold">{cost.label}</span>
                <span className="text-gray-600 text-right">{cost.detail}</span>
              </li>
            ))}
          </ul>
          <Link href="/calculator" className="text-blue-600 font-semibold inline-block mt-3">
            Estimate land transfer tax
          </Link>
        </div>
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Seller quick checklist</h3>
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
            {sellingChecklist.map((list) => (
              <SimpleChecklist key={list.title} title={list.title} items={list.items} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
