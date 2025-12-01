# DocuSign Integration Setup Guide

## ✅ DocuSign Integration Complete!

Your platform now supports professional electronic signatures via DocuSign.

---

## 📋 What's Been Added

### 1. **DocuSign Service** (`utils/docusignService.js`)
- Send documents for signature
- Multiple signer support
- Embedded signing URLs
- Status tracking
- Signed document download
- Webhook handling

### 2. **DocuSign Routes** (`routes/docusign.routes.js`)
- Send documents for signature
- Send to multiple signers (buyer + seller)
- Get signing URLs
- Download signed documents
- Handle webhook events
- Void/cancel envelopes

### 3. **Document Model Updates**
- DocuSign envelope tracking
- Signature status
- Multiple signer support
- Completion tracking

---

## 🚀 Setup Instructions

### Step 1: Install DocuSign Package

```bash
npm install docusign-esign
```

### Step 2: Create DocuSign Account

1. Go to [DocuSign Developer Center](https://developers.docusign.com/)
2. Create a free developer account
3. Create an integration (app)

### Step 3: Get API Credentials

You'll need:
- **Integrator Key** (Client ID)
- **User ID** (your DocuSign account email)
- **RSA Key Pair** (for JWT authentication)

**Generate RSA Key Pair:**
```bash
# Generate private key
openssl genrsa -out private.key 2048

# Generate public key
openssl rsa -in private.key -pubout -out public.key
```

Upload the public key to DocuSign Developer Center.

### Step 4: Configure Environment Variables

Add to your `.env` file:

```env
# DocuSign Configuration
DOCUSIGN_INTEGRATOR_KEY=your-integrator-key-here
DOCUSIGN_CLIENT_ID=your-client-id-here
DOCUSIGN_USER_ID=your-email@example.com
DOCUSIGN_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
DOCUSIGN_API_BASE_PATH=https://demo.docusign.net/restapi
# For production: https://www.docusign.net/restapi

# DocuSign Webhook URL
DOCUSIGN_WEBHOOK_URL=https://yourdomain.com/api/documents/docusign/webhook
```

**Important Notes:**
- Use `demo.docusign.net` for testing/development
- Use `docusign.net` for production
- Private key should include `\n` for newlines
- Keep private key secure!

### Step 5: Grant Consent (First Time Only)

When first setting up, you need to grant consent:

1. Construct consent URL:
```
https://account-d.docusign.com/oauth/auth?
  response_type=code&
  scope=signature%20impersonation&
  client_id=YOUR_INTEGRATOR_KEY&
  redirect_uri=YOUR_REDIRECT_URI
```

2. Visit URL in browser
3. Log in and grant consent
4. After consent, JWT authentication will work

### Step 6: Configure Webhook (Optional but Recommended)

1. Go to DocuSign Admin → Connect
2. Create new Connect configuration
3. Set webhook URL: `https://yourdomain.com/api/documents/docusign/webhook`
4. Select events:
   - Envelope Sent
   - Envelope Delivered
   - Envelope Signed
   - Envelope Completed
   - Envelope Declined
   - Envelope Voided

---

## 📧 API Endpoints

### Send Document for Signature

**POST** `/api/documents/docusign/send`
```json
{
  "documentId": "document_id_here",
  "signerEmail": "signer@example.com",
  "signerName": "John Doe",
  "emailSubject": "Please sign this document",
  "emailBlurb": "Please review and sign",
  "returnUrl": "https://yourdomain.com/documents/signed"
}
```

### Send to Multiple Signers (Transaction)

**POST** `/api/documents/docusign/send-transaction`
```json
{
  "transactionId": "transaction_id",
  "documentId": "document_id",
  "emailSubject": "Please sign purchase agreement",
  "emailBlurb": "Both parties need to sign"
}
```

### Get Signing URL (Embedded Signing)

**GET** `/api/documents/docusign/signing-url/:envelopeId?signerEmail=signer@example.com`

### Check Status

**GET** `/api/documents/docusign/status/:envelopeId`

### Download Signed Document

**GET** `/api/documents/docusign/download/:envelopeId`

### Void/Cancel

**POST** `/api/documents/docusign/void/:envelopeId`
```json
{
  "reason": "Cancelled by user"
}
```

### Webhook Handler

**POST** `/api/documents/docusign/webhook`
- Automatically called by DocuSign
- Updates document status
- Notifies parties

---

## 💡 Usage Examples

### Example 1: Send Purchase Agreement for Signature

```javascript
// Buyer and Seller both sign
POST /api/documents/docusign/send-transaction
{
  "transactionId": "transaction_123",
  "documentId": "document_456",
  "emailSubject": "Please Sign Purchase Agreement"
}
```

### Example 2: Send Disclosure Statement

```javascript
// Seller signs disclosure
POST /api/documents/docusign/send
{
  "documentId": "disclosure_123",
  "signerEmail": "seller@example.com",
  "signerName": "Jane Seller",
  "emailSubject": "Property Disclosure Statement"
}
```

### Example 3: Get Embedded Signing URL

```javascript
// For in-app signing experience
GET /api/documents/docusign/signing-url/ENV123?signerEmail=signer@example.com

// Returns:
{
  "url": "https://demo.docusign.net/Signing/...",
  "envelopeId": "ENV123"
}
```

---

## 🔐 Security Features

1. **JWT Authentication**
   - Secure API authentication
   - No password storage
   - Token-based access

2. **Audit Trail**
   - All signature events tracked
   - IP addresses recorded
   - Timestamps for all actions

3. **Legal Compliance**
   - Legally binding signatures
   - Compliance with e-signature laws
   - Court-admissible documents

4. **Access Control**
   - Only authorized users can send documents
   - Only signers can access signing URLs
   - Webhook validation

---

## 📊 Status Tracking

### Envelope Statuses:

- **sent** - Document sent to signer(s)
- **delivered** - Document delivered to signer(s)
- **signed** - One or more signers have signed
- **completed** - All signers have signed
- **declined** - Signer declined to sign
- **voided** - Document voided/cancelled

### Document Status Mapping:

- DocuSign `completed` → Platform `Approved`
- DocuSign `declined` → Platform `Rejected`
- DocuSign `voided` → Platform `Cancelled`

---

## ⚖️ Legal Compliance

### DocuSign Signatures Are:

✅ **Legally Binding** in Canada
✅ **Court Admissible**
✅ **Regulatory Compliant**
✅ **Audit Trail Protected**

### Compliance Features:

- Electronic Signature Act compliance
- Tamper-evident seals
- Complete audit trail
- Certificate of completion
- Legal validity in all Canadian provinces

---

## 💰 DocuSign Pricing

### Plans:

1. **Personal** - Free (limited)
2. **Standard** - ~$15/month
3. **Business Pro** - ~$45/month
4. **Enterprise** - Custom pricing

### Recommendation:

- Start with **Business Pro** for production
- Use **Demo** account for development/testing

---

## 🐛 Troubleshooting

### Common Issues:

1. **Authentication Failed**
   - Check credentials in `.env`
   - Verify RSA key pair
   - Ensure consent granted

2. **Documents Not Sending**
   - Verify file path exists
   - Check file format (PDF recommended)
   - Verify signer email addresses

3. **Webhooks Not Working**
   - Check webhook URL is accessible
   - Verify webhook configuration in DocuSign
   - Check server logs

4. **Signing URL Not Working**
   - Verify signer email matches
   - Check envelope status
   - Ensure URL hasn't expired

---

## 📝 Next Steps

1. **Install Package:**
   ```bash
   npm install docusign-esign
   ```

2. **Set Up DocuSign Account:**
   - Create developer account
   - Get API credentials
   - Generate RSA keys

3. **Configure Environment:**
   - Add credentials to `.env`
   - Test connection

4. **Test Integration:**
   - Send test document
   - Verify signatures work
   - Test webhook

5. **Production Setup:**
   - Switch to production API
   - Configure webhooks
   - Test full flow

---

## ✅ Features Included

- ✅ Send documents for signature
- ✅ Multiple signer support
- ✅ Embedded signing (in-app)
- ✅ Email-based signing
- ✅ Status tracking
- ✅ Signed document download
- ✅ Webhook events
- ✅ Void/cancel documents
- ✅ Audit trail
- ✅ Legal compliance

---

**Your platform now has professional electronic signature capabilities!**

Users can sign documents securely, legally, and conveniently through DocuSign integration.

