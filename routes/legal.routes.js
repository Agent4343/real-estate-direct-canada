const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getAllProvinces } = require('../config/provincialRegulations');

/**
 * @route   GET /api/legal/terms
 * @desc    Get Terms of Service
 * @access  Public
 */
router.get('/terms', (req, res) => {
  const version = '1.0.0';
  const lastUpdated = new Date('2024-01-01').toISOString();
  
  res.json({
    version,
    lastUpdated,
    title: 'Terms of Service',
    terms: `
TERMS OF SERVICE - Real Estate Direct Platform

Last Updated: ${lastUpdated}

IMPORTANT: PLEASE READ THESE TERMS CAREFULLY

1. ACCEPTANCE OF TERMS
By accessing and using this platform, you accept and agree to be bound by these Terms of Service.

2. PLATFORM NATURE AND DISCLAIMER

2.1 TECHNOLOGY PLATFORM ONLY
This platform is a technology service provider and listing platform. We provide:
- Technology infrastructure for listing properties
- Tools for searching and viewing property listings
- Communication tools for buyers and sellers
- Information resources about real estate processes
- Referral services (mortgages, lawyers)

2.2 NOT A REAL ESTATE BROKERAGE
WE ARE NOT A LICENSED REAL ESTATE BROKERAGE. We do NOT:
- Represent buyers or sellers in real estate transactions
- Provide real estate brokerage services
- Negotiate deals on behalf of users
- Provide real estate advice or valuations
- Act as an intermediary in transactions
- Handle deposits or escrow funds as a brokerage
- Earn real estate commissions

2.3 DIRECT TRANSACTIONS (FSBO)
This platform facilitates FOR SALE BY OWNER (FSBO) transactions where:
- Buyers and sellers transact DIRECTLY with each other
- Platform is NOT a party to transactions
- Platform does NOT represent either party
- Platform provides technology services only

3. USER RESPONSIBILITIES AND ACKNOWLEDGMENTS

3.1 DUE DILIGENCE
Users are SOLELY responsible for:
- Conducting their own due diligence on properties
- Verifying all property information
- Inspecting properties before purchase
- Verifying legal status of properties
- Checking property titles and encumbrances
- Obtaining property surveys and reports

3.2 PROFESSIONAL CONSULTATION REQUIRED
Users MUST consult licensed professionals:
- Real estate lawyers for legal advice and transaction handling
- Home inspectors for property condition assessments
- Financial advisors for mortgage and financial decisions
- Accountants for tax implications
- Other licensed professionals as needed

3.3 PROVINCIAL COMPLIANCE
Users MUST comply with ALL applicable provincial regulations including:
- Property disclosure requirements
- Cooling-off periods
- Deposit requirements
- Legal documentation requirements
- Any other provincial real estate regulations

3.4 ACCURACY OF INFORMATION
- Property information is provided by sellers
- Platform does NOT verify property information
- Platform does NOT guarantee accuracy of listings
- Users must verify all information independently

4. NO WARRANTIES OR REPRESENTATIONS

4.1 PROPERTY INFORMATION
- Property information is provided "AS IS" without warranties
- Platform does NOT verify property information
- Platform does NOT inspect properties
- Platform does NOT guarantee property condition
- Platform does NOT guarantee legal status

4.2 TRANSACTION OUTCOMES
- Platform does NOT guarantee successful transactions
- Platform is NOT responsible for transaction disputes
- Platform does NOT mediate disputes
- Platform is NOT liable for transaction failures

4.3 NO PROFESSIONAL ADVICE
- Platform does NOT provide legal advice
- Platform does NOT provide financial advice
- Platform does NOT provide real estate advice
- All information is for informational purposes only

5. LIMITATION OF LIABILITY

To the maximum extent permitted by law, the platform is NOT liable for:

5.1 TRANSACTION-RELATED DAMAGES
- Property condition issues
- Transaction disputes
- Financial losses
- Regulatory non-compliance by users
- Breach of contract between users

5.2 INFORMATION-RELATED DAMAGES
- Inaccurate property information
- Misleading listings
- Omitted information
- Information provided by third parties

5.3 PLATFORM-RELATED DAMAGES
- Service interruptions
- Technical failures
- Data loss
- Security breaches (subject to privacy policy)

5.4 THIRD-PARTY SERVICES
- Services provided by lawyers, inspectors, or other professionals
- Mortgage products from banks or lenders
- Any services accessed through platform referrals

6. FEES AND PAYMENTS

6.1 PLATFORM FEES
- Listing fee: Paid upfront when listing is created
- Success fee: Paid only when property sells successfully
- All fees are clearly disclosed before payment
- Fees are for technology services, NOT real estate commissions

6.2 NO REFUNDS
- Listing fees are non-refundable
- Success fees are due upon successful sale completion
- No refunds for failed transactions

7. PROHIBITED ACTIVITIES

Users may NOT:
- Use platform for fraudulent purposes
- Misrepresent properties or themselves
- Violate provincial regulations
- Infringe on intellectual property rights
- Attempt to circumvent platform fees
- Use platform to compete with platform

8. INTELLECTUAL PROPERTY

All platform content, design, functionality, and technology are owned by Real Estate Direct Platform. Users may NOT copy, reproduce, or use platform content without permission.

9. TERMINATION

Platform reserves the right to:
- Suspend or terminate user accounts
- Remove listings that violate terms
- Block users who violate terms
- Take legal action for violations

10. MODIFICATIONS TO TERMS

Platform reserves the right to modify these terms at any time. Continued use after modifications constitutes acceptance of new terms.

11. GOVERNING LAW

These terms are governed by Canadian law and applicable provincial regulations. Disputes will be resolved in Canadian courts.

12. SEVERABILITY

If any provision of these terms is found unenforceable, remaining provisions remain in effect.

13. ACKNOWLEDGMENT

By using this platform, you acknowledge that you have read, understood, and agree to these Terms of Service. You acknowledge that:
- Platform is NOT a real estate brokerage
- Platform does NOT represent you
- You are responsible for your own transactions
- You must consult licensed professionals

For questions, contact: legal@realestatedirect.ca
    `
  });
});

/**
 * @route   GET /api/legal/privacy
 * @desc    Get Privacy Policy
 * @access  Public
 */
router.get('/privacy', (req, res) => {
  const version = '1.0.0';
  const lastUpdated = new Date('2024-01-01').toISOString();
  
  res.json({
    version,
    lastUpdated,
    title: 'Privacy Policy',
    policy: `
PRIVACY POLICY - Real Estate Direct Platform

Last Updated: ${lastUpdated}

1. INFORMATION COLLECTION
We collect information you provide directly including:
- Name, email, phone number
- Property listing information
- Transaction details
- Location data

2. INFORMATION USE
We use collected information to:
- Provide platform services
- Facilitate property listings and transactions
- Improve our services
- Comply with legal requirements

3. INFORMATION SHARING
We may share information with:
- Other users (for transaction purposes)
- Service providers (lawyers, banks)
- Legal authorities (when required)
- Regulatory bodies (as required by law)

4. DATA SECURITY
We implement security measures to protect your information, but cannot guarantee absolute security.

5. COOKIES AND TRACKING
We use cookies and similar technologies to improve user experience.

6. YOUR RIGHTS
Under PIPEDA, you have the right to:
- Access your personal information
- Request corrections
- Withdraw consent
- File complaints with privacy authorities

7. RETENTION
We retain information as long as necessary for platform operations and legal compliance.

8. CONTACT
For privacy concerns, contact: privacy@realestatedirect.ca
    `
  });
});

/**
 * @route   GET /api/legal/disclaimer
 * @desc    Get Platform Disclaimer
 * @access  Public
 */
router.get('/disclaimer', (req, res) => {
  res.json({
    title: 'Platform Disclaimer',
    disclaimer: `
⚠️ IMPORTANT PLATFORM DISCLAIMERS ⚠️

READ THIS CAREFULLY BEFORE USING THIS PLATFORM

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. NOT A REAL ESTATE BROKERAGE

This platform is a TECHNOLOGY SERVICE PROVIDER and LISTING PLATFORM.

WE ARE NOT A LICENSED REAL ESTATE BROKERAGE.

We do NOT:
❌ Represent buyers or sellers
❌ Provide real estate brokerage services
❌ Negotiate deals on behalf of users
❌ Provide real estate advice
❌ Act as an intermediary in transactions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. DIRECT TRANSACTIONS (FOR SALE BY OWNER)

This platform facilitates DIRECT transactions between buyers and sellers.

- Buyers and sellers transact DIRECTLY with each other
- Platform is NOT a party to transactions
- Platform provides technology services only
- Users are responsible for their own transactions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. NO PROFESSIONAL ADVICE

We do NOT provide:
❌ Legal advice
❌ Financial advice
❌ Real estate advice
❌ Property valuations
❌ Market analysis

All information is for INFORMATIONAL PURPOSES ONLY.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. PROPERTY INFORMATION DISCLAIMER

⚠️ Property information is provided by sellers and NOT verified by us.

We do NOT:
❌ Inspect properties
❌ Verify property information
❌ Guarantee accuracy of listings
❌ Guarantee property condition
❌ Guarantee legal status

YOU MUST:
✅ Conduct your own inspections
✅ Verify all property information
✅ Do your own due diligence
✅ Consult licensed professionals

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5. TRANSACTION DISCLAIMER

⚠️ We are NOT involved in your transactions.

We do NOT:
❌ Represent buyers or sellers
❌ Handle funds or deposits (as a brokerage)
❌ Manage escrow accounts (as a brokerage)
❌ Mediate disputes
❌ Guarantee transaction outcomes

YOU ARE SOLELY RESPONSIBLE for:
✅ All transaction decisions
✅ Transaction outcomes
✅ Dispute resolution
✅ Compliance with regulations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. PROFESSIONAL CONSULTATION REQUIRED

YOU MUST consult licensed professionals:

✅ Real Estate Lawyers - for legal advice and transaction handling
✅ Home Inspectors - for property condition assessments
✅ Financial Advisors - for mortgage and financial decisions
✅ Accountants - for tax implications

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

7. PROVINCIAL REGULATIONS

⚠️ You must comply with ALL provincial real estate regulations.

Each province has different requirements for:
- Property disclosures
- Cooling-off periods
- Deposit requirements
- Legal documentation
- Other regulatory requirements

Platform provides information about regulations, but you are responsible for compliance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

8. LIMITATION OF LIABILITY

To the maximum extent permitted by law, we are NOT liable for:

❌ Property condition issues
❌ Transaction disputes
❌ Regulatory non-compliance by users
❌ Financial losses
❌ Inaccurate property information
❌ Transaction failures
❌ User misunderstandings

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

9. PLATFORM FEES

Our fees are for TECHNOLOGY SERVICES, not real estate commissions:
- Listing fee: For platform hosting and technology services
- Success fee: For technology platform services upon successful sale

These are NOT real estate brokerage commissions.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10. USE AT YOUR OWN RISK

⚠️ USE OF THIS PLATFORM IS AT YOUR OWN RISK.

You are SOLELY RESPONSIBLE for:
- All decisions made through this platform
- All transactions
- All due diligence
- All professional consultations
- All regulatory compliance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

By using this platform, you acknowledge that you have read, understood, 
and agree to all of the above disclaimers.

If you do not agree, DO NOT USE THIS PLATFORM.

For questions, contact: legal@realestatedirect.ca
    `
  });
});

/**
 * @route   GET /api/legal/provinces
 * @desc    Get provincial regulations information
 * @access  Public
 */
router.get('/provinces', (req, res) => {
  const provinces = getAllProvinces();
  
  res.json({
    provinces: provinces.map(province => ({
      code: province.code,
      name: province.name,
      regulatoryBody: province.regulatoryBody,
      regulatoryBodyName: province.regulatoryBodyName,
      website: province.website,
      disclosureRequirements: province.disclosureRequirements,
      coolingOffPeriod: province.coolingOffPeriod,
      depositRequirements: province.depositRequirements,
      mandatoryDisclosures: province.mandatoryDisclosures
    }))
  });
});

/**
 * @route   POST /api/legal/accept-terms
 * @desc    Accept terms of service
 * @access  Private
 */
router.post('/accept-terms', authenticateToken, async (req, res) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { version } = req.body;
    user.acceptTerms(version || '1.0.0');
    await user.save();

    res.json({ 
      message: 'Terms accepted successfully',
      acceptedDate: user.termsAccepted.tosAcceptedDate
    });
  } catch (err) {
    console.error('Error accepting terms:', err);
    res.status(500).json({ message: 'Error accepting terms', error: err.message });
  }
});

/**
 * @route   POST /api/legal/accept-privacy
 * @desc    Accept privacy policy
 * @access  Private
 */
router.post('/accept-privacy', authenticateToken, async (req, res) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { version } = req.body;
    user.termsAccepted.privacyPolicy = true;
    user.termsAccepted.privacyPolicyVersion = version || '1.0.0';
    user.termsAccepted.privacyPolicyAcceptedDate = new Date();
    await user.save();

    res.json({ 
      message: 'Privacy policy accepted successfully',
      acceptedDate: user.termsAccepted.privacyPolicyAcceptedDate
    });
  } catch (err) {
    console.error('Error accepting privacy policy:', err);
    res.status(500).json({ message: 'Error accepting privacy policy', error: err.message });
  }
});

/**
 * @route   POST /api/legal/acknowledge-province
 * @desc    Acknowledge province regulations
 * @access  Private
 */
router.post('/acknowledge-province', authenticateToken, async (req, res) => {
  try {
    const User = require('../models/User.model');
    const { getProvincialRegulations } = require('../config/provincialRegulations');
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { province, version } = req.body;
    
    if (!province) {
      return res.status(400).json({ message: 'Province is required' });
    }

    const regulations = getProvincialRegulations(province);
    if (!regulations) {
      return res.status(400).json({ message: 'Invalid province code' });
    }

    user.acknowledgeProvinceRegulation(province.toUpperCase(), version || '1.0.0');
    await user.save();

    res.json({ 
      message: 'Province regulations acknowledged successfully',
      province: province.toUpperCase(),
      acknowledgedDate: user.provinceRegulationAcknowledgment.get(province.toUpperCase()).acknowledgedDate
    });
  } catch (err) {
    console.error('Error acknowledging province regulations:', err);
    res.status(500).json({ message: 'Error acknowledging province regulations', error: err.message });
  }
});

module.exports = router;
