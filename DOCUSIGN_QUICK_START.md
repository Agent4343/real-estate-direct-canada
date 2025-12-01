# DocuSign Quick Start Guide

## ✅ DocuSign Integration Added!

Your platform now supports professional electronic signatures via DocuSign.

---

## 🚀 Quick Setup

### 1. Install Package
```bash
npm install docusign-esign
```

### 2. Get DocuSign Credentials

1. Sign up at: https://developers.docusign.com/
2. Create integration/app
3. Generate RSA key pair:
   ```bash
   openssl genrsa -out private.key 2048
   openssl rsa -in private.key -pubout -out public.key
   ```
4. Upload public key to DocuSign

### 3. Add to `.env`:
```env
DOCUSIGN_INTEGRATOR_KEY=your-key-here
DOCUSIGN_CLIENT_ID=your-client-id
DOCUSIGN_USER_ID=your-email@example.com
DOCUSIGN_PRIVATE_KEY=-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----
DOCUSIGN_API_BASE_PATH=https://demo.docusign.net/restapi
```

### 4. Grant Consent (First Time)
Visit consent URL in browser to authorize your app.

---

## 📧 How to Use

### Send Document for Signature:

```bash
POST /api/documents/docusign/send
{
  "documentId": "document_123",
  "signerEmail": "buyer@example.com",
  "signerName": "John Buyer"
}
```

### Send to Buyer + Seller:

```bash
POST /api/documents/docusign/send-transaction
{
  "transactionId": "transaction_123",
  "documentId": "document_123"
}
```

---

**See `docs/DOCUSIGN_SETUP_GUIDE.md` for complete setup instructions!**

