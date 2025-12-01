/**
 * DocuSign Service Integration
 * Handles electronic signatures via DocuSign API
 * 
 * Requires: npm install docusign-esign
 * DocuSign API: https://developers.docusign.com/
 */

const docusign = require('docusign-esign');
const fs = require('fs');
const path = require('path');

// DocuSign Configuration (from environment variables)
const DOCUSIGN_CONFIG = {
  integratorKey: process.env.DOCUSIGN_INTEGRATOR_KEY || '',
  clientId: process.env.DOCUSIGN_CLIENT_ID || '',
  userId: process.env.DOCUSIGN_USER_ID || '',
  privateKey: process.env.DOCUSIGN_PRIVATE_KEY || '',
  apiBasePath: process.env.DOCUSIGN_API_BASE_PATH || 'https://demo.docusign.net/restapi', // demo or production
  redirectUri: process.env.DOCUSIGN_REDIRECT_URI || 'http://localhost:3000/api/documents/docusign/callback'
};

/**
 * Initialize DocuSign API Client
 */
function getApiClient() {
  const apiClient = new docusign.ApiClient();
  apiClient.setBasePath(DOCUSIGN_CONFIG.apiBasePath);
  return apiClient;
}

/**
 * Get JWT Token for authentication
 */
async function getJWTToken() {
  try {
    const jwtLifeSec = 3600; // Requested lifetime for the JWT is 3600 seconds (1 hour)
    const apiClient = getApiClient();
    
    // Create JWT request
    const jwtRequest = docusign.RequestJWTUserToken(
      DOCUSIGN_CONFIG.clientId,
      DOCUSIGN_CONFIG.userId,
      'signature impersonation',
      DOCUSIGN_CONFIG.privateKey,
      jwtLifeSec
    );
    
    const results = await apiClient.requestJWTUserToken(jwtRequest);
    const accessToken = results.body.access_token;
    
    // Get user info
    apiClient.addDefaultHeader('Authorization', `Bearer ${accessToken}`);
    const userInfoResults = await apiClient.getUserInfo(accessToken);
    
    return {
      accessToken,
      accountId: userInfoResults.accounts[0].accountId,
      basePath: userInfoResults.accounts[0].baseUri + '/restapi'
    };
  } catch (err) {
    console.error('Error getting JWT token:', err);
    throw new Error('DocuSign authentication failed: ' + err.message);
  }
}

/**
 * Send document for signature via DocuSign
 */
async function sendDocumentForSignature(documentData) {
  try {
    const {
      documentPath, // Path to PDF file
      documentName,
      signerEmail,
      signerName,
      signerClientUserId, // Optional: user ID in your system
      emailSubject,
      emailBlurb,
      returnUrl // URL to redirect after signing
    } = documentData;
    
    // Authenticate
    const authResult = await getJWTToken();
    const apiClient = getApiClient();
    apiClient.setBasePath(authResult.basePath);
    apiClient.addDefaultHeader('Authorization', `Bearer ${authResult.accessToken}`);
    
    // Read document file
    const documentBuffer = fs.readFileSync(documentPath);
    const base64Document = Buffer.from(documentBuffer).toString('base64');
    
    // Create envelope definition
    const envelopeDefinition = {
      emailSubject: emailSubject || `Please sign: ${documentName}`,
      emailBlurb: emailBlurb || 'Please review and sign this document.',
      documents: [{
        documentBase64: base64Document,
        name: documentName,
        fileExtension: 'pdf',
        documentId: '1'
      }],
      recipients: {
        signers: [{
          email: signerEmail,
          name: signerName,
          recipientId: '1',
          clientUserId: signerClientUserId || signerEmail, // Optional: for embedded signing
          routingOrder: '1',
          tabs: {
            signHereTabs: [{
              documentId: '1',
              pageNumber: '1',
              xPosition: '100',
              yPosition: '100'
            }]
          }
        }]
      },
      status: 'sent' // 'sent' or 'created' for draft
    };
    
    // Create envelope
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const envelope = await envelopesApi.createEnvelope(authResult.accountId, {
      envelopeDefinition: envelopeDefinition
    });
    
    return {
      success: true,
      envelopeId: envelope.envelopeId,
      status: envelope.status,
      uri: envelope.uri
    };
  } catch (err) {
    console.error('Error sending document for signature:', err);
    throw new Error('Failed to send document for signature: ' + err.message);
  }
}

/**
 * Send document to multiple signers
 */
async function sendDocumentToMultipleSigners(documentData) {
  try {
    const {
      documentPath,
      documentName,
      signers, // Array of {email, name, routingOrder, clientUserId}
      emailSubject,
      emailBlurb,
      returnUrl
    } = documentData;
    
    // Authenticate
    const authResult = await getJWTToken();
    const apiClient = getApiClient();
    apiClient.setBasePath(authResult.basePath);
    apiClient.addDefaultHeader('Authorization', `Bearer ${authResult.accessToken}`);
    
    // Read document file
    const documentBuffer = fs.readFileSync(documentPath);
    const base64Document = Buffer.from(documentBuffer).toString('base64');
    
    // Prepare signers
    const signerRecipients = signers.map((signer, index) => ({
      email: signer.email,
      name: signer.name,
      recipientId: (index + 1).toString(),
      clientUserId: signer.clientUserId || signer.email,
      routingOrder: signer.routingOrder || (index + 1).toString(),
      tabs: {
        signHereTabs: signer.signHereTabs || [{
          documentId: '1',
          pageNumber: '1',
          xPosition: '100',
          yPosition: (100 + (index * 150)).toString()
        }]
      }
    }));
    
    // Create envelope definition
    const envelopeDefinition = {
      emailSubject: emailSubject || `Please sign: ${documentName}`,
      emailBlurb: emailBlurb || 'Please review and sign this document.',
      documents: [{
        documentBase64: base64Document,
        name: documentName,
        fileExtension: 'pdf',
        documentId: '1'
      }],
      recipients: {
        signers: signerRecipients
      },
      status: 'sent'
    };
    
    // Create envelope
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const envelope = await envelopesApi.createEnvelope(authResult.accountId, {
      envelopeDefinition: envelopeDefinition
    });
    
    return {
      success: true,
      envelopeId: envelope.envelopeId,
      status: envelope.status,
      uri: envelope.uri
    };
  } catch (err) {
    console.error('Error sending document to multiple signers:', err);
    throw new Error('Failed to send document: ' + err.message);
  }
}

/**
 * Get envelope status
 */
async function getEnvelopeStatus(envelopeId) {
  try {
    const authResult = await getJWTToken();
    const apiClient = getApiClient();
    apiClient.setBasePath(authResult.basePath);
    apiClient.addDefaultHeader('Authorization', `Bearer ${authResult.accessToken}`);
    
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const envelope = await envelopesApi.getEnvelope(authResult.accountId, envelopeId);
    
    return {
      envelopeId: envelope.envelopeId,
      status: envelope.status,
      statusDateTime: envelope.statusDateTime,
      completedDateTime: envelope.completedDateTime,
      recipients: envelope.recipients
    };
  } catch (err) {
    console.error('Error getting envelope status:', err);
    throw new Error('Failed to get envelope status: ' + err.message);
  }
}

/**
 * Get signed document PDF
 */
async function getSignedDocument(envelopeId) {
  try {
    const authResult = await getJWTToken();
    const apiClient = getApiClient();
    apiClient.setBasePath(authResult.basePath);
    apiClient.addDefaultHeader('Authorization', `Bearer ${authResult.accessToken}`);
    
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const documentPdf = await envelopesApi.getDocument(
      authResult.accountId,
      envelopeId,
      'combined' // 'combined' gets all documents merged, or specific document ID
    );
    
    return {
      document: documentPdf,
      base64: Buffer.from(documentPdf).toString('base64')
    };
  } catch (err) {
    console.error('Error getting signed document:', err);
    throw new Error('Failed to get signed document: ' + err.message);
  }
}

/**
 * Create embedded signing URL (for in-app signing)
 */
async function createEmbeddedSigningUrl(envelopeId, signerEmail, returnUrl) {
  try {
    const authResult = await getJWTToken();
    const apiClient = getApiClient();
    apiClient.setBasePath(authResult.basePath);
    apiClient.addDefaultHeader('Authorization', `Bearer ${authResult.accessToken}`);
    
    // Create recipient view request
    const recipientViewRequest = {
      authenticationMethod: 'none',
      email: signerEmail,
      userName: signerEmail,
      clientUserId: signerEmail,
      returnUrl: returnUrl || `${process.env.FRONTEND_URL}/documents/signed?envelopeId=${envelopeId}`
    };
    
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const viewUrl = await envelopesApi.createRecipientView(
      authResult.accountId,
      envelopeId,
      { recipientViewRequest: recipientViewRequest }
    );
    
    return {
      url: viewUrl.url,
      envelopeId: envelopeId
    };
  } catch (err) {
    console.error('Error creating embedded signing URL:', err);
    throw new Error('Failed to create signing URL: ' + err.message);
  }
}

/**
 * Void/Cancel an envelope
 */
async function voidEnvelope(envelopeId, reason) {
  try {
    const authResult = await getJWTToken();
    const apiClient = getApiClient();
    apiClient.setBasePath(authResult.basePath);
    apiClient.addDefaultHeader('Authorization', `Bearer ${authResult.accessToken}`);
    
    const envelopesApi = new docusign.EnvelopesApi(apiClient);
    const envelopeUpdate = {
      status: 'voided',
      voidedReason: reason || 'Cancelled by user'
    };
    
    await envelopesApi.update(authResult.accountId, envelopeId, {
      envelope: envelopeUpdate
    });
    
    return {
      success: true,
      envelopeId: envelopeId,
      status: 'voided'
    };
  } catch (err) {
    console.error('Error voiding envelope:', err);
    throw new Error('Failed to void envelope: ' + err.message);
  }
}

/**
 * Handle DocuSign webhook events
 */
function handleWebhookEvent(webhookData) {
  try {
    // DocuSign sends webhook events for envelope status changes
    const event = webhookData.event;
    const envelopeId = webhookData.data?.envelopeId;
    const status = webhookData.data?.status;
    
    // Map DocuSign status to platform status
    const statusMap = {
      'sent': 'Submitted',
      'delivered': 'Under Review',
      'signed': 'Approved',
      'completed': 'Completed',
      'declined': 'Rejected',
      'voided': 'Cancelled'
    };
    
    return {
      envelopeId: envelopeId,
      event: event,
      status: statusMap[status] || status,
      timestamp: new Date(),
      data: webhookData.data
    };
  } catch (err) {
    console.error('Error handling webhook event:', err);
    throw new Error('Failed to process webhook: ' + err.message);
  }
}

module.exports = {
  sendDocumentForSignature,
  sendDocumentToMultipleSigners,
  getEnvelopeStatus,
  getSignedDocument,
  createEmbeddedSigningUrl,
  voidEnvelope,
  handleWebhookEvent,
  getJWTToken
};

