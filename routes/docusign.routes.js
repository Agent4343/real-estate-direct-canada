const express = require('express');
const router = express.Router();
const docusignService = require('../utils/docusignService');
const Document = require('../models/Document.model');
const Transaction = require('../models/Transaction.model');
const Property = require('../models/Property.model');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

/**
 * @route   POST /api/documents/docusign/send
 * @desc    Send document for signature via DocuSign
 * @access  Private
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const {
      documentId,
      signerEmail,
      signerName,
      emailSubject,
      emailBlurb,
      returnUrl
    } = req.body;
    
    if (!documentId || !signerEmail) {
      return res.status(400).json({ 
        message: 'Document ID and signer email are required' 
      });
    }
    
    // Get document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check authorization
    if (document.userId.toString() !== req.user.userId) {
      const property = await Property.findById(document.propertyId);
      if (property && property.sellerId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }
    
    // Get file path
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document file not found' });
    }
    
    // Send to DocuSign
    const result = await docusignService.sendDocumentForSignature({
      documentPath: filePath,
      documentName: document.fileName,
      signerEmail: signerEmail,
      signerName: signerName || signerEmail,
      signerClientUserId: signerEmail,
      emailSubject: emailSubject || `Please sign: ${document.title}`,
      emailBlurb: emailBlurb || `Please review and sign this document: ${document.documentType}`,
      returnUrl: returnUrl || `${process.env.FRONTEND_URL}/documents/signed?documentId=${documentId}`
    });
    
    // Update document with DocuSign info
    document.signature.docusign = {
      enabled: true,
      envelopeId: result.envelopeId,
      envelopeStatus: result.status,
      signingUrl: null // Will be generated on request
    };
    document.signature.signatureType = 'DocuSign';
    document.signature.required = true;
    await document.save();
    
    res.json({
      message: 'Document sent for signature via DocuSign',
      envelopeId: result.envelopeId,
      status: result.status,
      documentId: document._id
    });
  } catch (err) {
    console.error('Error sending document via DocuSign:', err);
    res.status(500).json({ 
      message: 'Error sending document for signature', 
      error: err.message 
    });
  }
});

/**
 * @route   POST /api/documents/docusign/send-transaction
 * @desc    Send transaction documents for signature (multiple signers)
 * @access  Private
 */
router.post('/send-transaction', authenticateToken, async (req, res) => {
  try {
    const {
      transactionId,
      documentId,
      emailSubject,
      emailBlurb
    } = req.body;
    
    if (!transactionId || !documentId) {
      return res.status(400).json({ 
        message: 'Transaction ID and Document ID are required' 
      });
    }
    
    // Get transaction
    const transaction = await Transaction.findById(transactionId)
      .populate('buyerId', 'email name')
      .populate('sellerId', 'email name');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check authorization
    if (transaction.buyerId._id.toString() !== req.user.userId && 
        transaction.sellerId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get document
    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Get file path
    const filePath = path.join(__dirname, '..', document.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Document file not found' });
    }
    
    // Prepare signers
    const signers = [
      {
        email: transaction.sellerId.email,
        name: transaction.sellerId.name,
        routingOrder: '1',
        clientUserId: transaction.sellerId._id.toString()
      },
      {
        email: transaction.buyerId.email,
        name: transaction.buyerId.name,
        routingOrder: '2',
        clientUserId: transaction.buyerId._id.toString()
      }
    ];
    
    // Send to DocuSign
    const result = await docusignService.sendDocumentToMultipleSigners({
      documentPath: filePath,
      documentName: document.fileName,
      signers: signers,
      emailSubject: emailSubject || `Please sign: ${document.title}`,
      emailBlurb: emailBlurb || `Please review and sign this document for your transaction.`
    });
    
    // Update document with DocuSign info
    document.signature.docusign = {
      enabled: true,
      envelopeId: result.envelopeId,
      envelopeStatus: result.status,
      signers: signers.map(s => ({
        email: s.email,
        name: s.name,
        status: 'sent'
      }))
    };
    document.signature.signatureType = 'DocuSign';
    document.signature.required = true;
    await document.save();
    
    res.json({
      message: 'Document sent for signatures via DocuSign',
      envelopeId: result.envelopeId,
      status: result.status,
      signers: signers.length,
      documentId: document._id
    });
  } catch (err) {
    console.error('Error sending transaction document:', err);
    res.status(500).json({ 
      message: 'Error sending document for signature', 
      error: err.message 
    });
  }
});

/**
 * @route   GET /api/documents/docusign/status/:envelopeId
 * @desc    Get DocuSign envelope status
 * @access  Private
 */
router.get('/status/:envelopeId', authenticateToken, async (req, res) => {
  try {
    const { envelopeId } = req.params;
    
    const status = await docusignService.getEnvelopeStatus(envelopeId);
    
    // Update document status if found
    const document = await Document.findOne({
      'signature.docusign.envelopeId': envelopeId
    });
    
    if (document) {
      document.signature.docusign.envelopeStatus = status.status;
      if (status.completedDateTime) {
        document.signature.docusign.completedDate = new Date(status.completedDateTime);
        document.signature.signed = status.status === 'completed';
        document.signature.signedDate = new Date(status.completedDateTime);
        document.status = 'Approved';
      }
      await document.save();
    }
    
    res.json({
      envelopeId: envelopeId,
      status: status,
      documentId: document?._id
    });
  } catch (err) {
    console.error('Error getting envelope status:', err);
    res.status(500).json({ 
      message: 'Error getting envelope status', 
      error: err.message 
    });
  }
});

/**
 * @route   GET /api/documents/docusign/signing-url/:envelopeId
 * @desc    Get embedded signing URL
 * @access  Private
 */
router.get('/signing-url/:envelopeId', authenticateToken, async (req, res) => {
  try {
    const { envelopeId } = req.params;
    const { signerEmail, returnUrl } = req.query;
    
    if (!signerEmail) {
      return res.status(400).json({ message: 'Signer email is required' });
    }
    
    // Verify user is the signer
    const User = require('../models/User.model');
    const user = await User.findById(req.user.userId);
    if (user.email !== signerEmail) {
      return res.status(403).json({ message: 'Not authorized to sign as this email' });
    }
    
    const signingUrl = await docusignService.createEmbeddedSigningUrl(
      envelopeId,
      signerEmail,
      returnUrl
    );
    
    // Update document with signing URL
    const document = await Document.findOne({
      'signature.docusign.envelopeId': envelopeId
    });
    
    if (document) {
      document.signature.docusign.signingUrl = signingUrl.url;
      await document.save();
    }
    
    res.json({
      url: signingUrl.url,
      envelopeId: envelopeId,
      expiresIn: 300 // 5 minutes typical
    });
  } catch (err) {
    console.error('Error creating signing URL:', err);
    res.status(500).json({ 
      message: 'Error creating signing URL', 
      error: err.message 
    });
  }
});

/**
 * @route   GET /api/documents/docusign/download/:envelopeId
 * @desc    Download signed document from DocuSign
 * @access  Private
 */
router.get('/download/:envelopeId', authenticateToken, async (req, res) => {
  try {
    const { envelopeId } = req.params;
    
    // Check authorization
    const document = await Document.findOne({
      'signature.docusign.envelopeId': envelopeId
    }).populate('propertyId');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    const property = document.propertyId;
    const isSeller = property?.sellerId?.toString() === req.user.userId;
    
    if (!isSeller && document.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const signedDocument = await docusignService.getSignedDocument(envelopeId);
    
    // Save signed document
    const signedFileName = `signed-${envelopeId}.pdf`;
    const signedFilePath = path.join(__dirname, '..', 'uploads', 'documents', signedFileName);
    fs.writeFileSync(signedFilePath, signedDocument.document);
    
    // Update document
    document.fileUrl = `/uploads/documents/${signedFileName}`;
    await document.save();
    
    res.json({
      message: 'Signed document downloaded',
      documentUrl: document.fileUrl,
      envelopeId: envelopeId
    });
  } catch (err) {
    console.error('Error downloading signed document:', err);
    res.status(500).json({ 
      message: 'Error downloading signed document', 
      error: err.message 
    });
  }
});

/**
 * @route   POST /api/documents/docusign/webhook
 * @desc    Handle DocuSign webhook events
 * @access  Public (DocuSign calls this)
 */
router.post('/webhook', async (req, res) => {
  try {
    // DocuSign webhook handler
    const webhookData = req.body;
    
    // Process webhook event
    const event = docusignService.handleWebhookEvent(webhookData);
    
    // Find and update document
    if (event.envelopeId) {
      const document = await Document.findOne({
        'signature.docusign.envelopeId': event.envelopeId
      });
      
      if (document) {
        document.signature.docusign.envelopeStatus = event.status.toLowerCase();
        
        if (event.status === 'Completed' || event.status === 'Approved') {
          document.signature.signed = true;
          document.signature.signedDate = event.timestamp;
          document.status = 'Approved';
          document.signature.docusign.completedDate = event.timestamp;
        }
        
        await document.save();
        
        // TODO: Notify parties about status change
      }
    }
    
    // Always return 200 to DocuSign
    res.status(200).json({ message: 'Webhook received' });
  } catch (err) {
    console.error('Error processing DocuSign webhook:', err);
    // Still return 200 to avoid DocuSign retries
    res.status(200).json({ message: 'Webhook received (error logged)' });
  }
});

/**
 * @route   POST /api/documents/docusign/void/:envelopeId
 * @desc    Void/cancel a DocuSign envelope
 * @access  Private
 */
router.post('/void/:envelopeId', authenticateToken, async (req, res) => {
  try {
    const { envelopeId } = req.params;
    const { reason } = req.body;
    
    // Check authorization
    const document = await Document.findOne({
      'signature.docusign.envelopeId': envelopeId
    });
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (document.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to void this document' });
    }
    
    const result = await docusignService.voidEnvelope(envelopeId, reason);
    
    // Update document
    document.signature.docusign.envelopeStatus = 'voided';
    document.status = 'Cancelled';
    await document.save();
    
    res.json({
      message: 'Envelope voided successfully',
      result
    });
  } catch (err) {
    console.error('Error voiding envelope:', err);
    res.status(500).json({ 
      message: 'Error voiding envelope', 
      error: err.message 
    });
  }
});

module.exports = router;

