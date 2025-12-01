const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('../models/Document.model');
const FormTemplate = require('../models/FormTemplate.model');
const Property = require('../models/Property.model');
const Transaction = require('../models/Transaction.model');
const { authenticateToken } = require('../middleware/auth');
const { validateProvincialCompliance } = require('../middleware/compliance');
const { getProvincialRegulations } = require('../config/provincialRegulations');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/documents/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, and TXT files are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

/**
 * @route   GET /api/documents/templates
 * @desc    Get form templates for a province
 * @access  Public
 */
router.get('/templates', async (req, res) => {
  try {
    const { province, documentType } = req.query;
    
    const query = { active: true };
    if (province) {
      query.$or = [
        { province: province.toUpperCase() },
        { province: 'ALL' }
      ];
    }
    if (documentType) {
      query.documentType = documentType;
    }
    
    const templates = await FormTemplate.find(query).sort({ mandatory: -1, formName: 1 });
    
    res.json({
      templates,
      count: templates.length
    });
  } catch (err) {
    console.error('Error fetching templates:', err);
    res.status(500).json({ message: 'Error fetching templates', error: err.message });
  }
});

/**
 * @route   GET /api/documents/templates/:province
 * @desc    Get all required forms for a province
 * @access  Public
 */
router.get('/templates/:province', async (req, res) => {
  try {
    const province = req.params.province.toUpperCase();
    const regulations = getProvincialRegulations(province);
    
    if (!regulations) {
      return res.status(400).json({ message: 'Invalid province code' });
    }
    
    // Get mandatory templates for this province
    const templates = await FormTemplate.find({
      $or: [
        { province: province },
        { province: 'ALL' }
      ],
      active: true,
      mandatory: true
    }).sort({ documentType: 1 });
    
    res.json({
      province,
      regulatoryBody: regulations.regulatoryBodyName,
      mandatoryDisclosures: regulations.mandatoryDisclosures,
      requiredForms: templates,
      count: templates.length
    });
  } catch (err) {
    console.error('Error fetching province templates:', err);
    res.status(500).json({ message: 'Error fetching templates', error: err.message });
  }
});

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a document (property disclosure, agreement, etc.)
 * @access  Private
 */
router.post('/upload', authenticateToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const {
      documentType,
      propertyId,
      transactionId,
      title,
      description,
      province,
      required,
      emailAddress,
      submittedViaEmail
    } = req.body;
    
    if (!propertyId || !documentType) {
      return res.status(400).json({ 
        message: 'Property ID and document type are required' 
      });
    }
    
    // Verify property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user is associated with property
    const isSeller = property.sellerId.toString() === req.user.userId;
    let isBuyer = false;
    
    if (transactionId) {
      const transaction = await Transaction.findById(transactionId);
      if (transaction) {
        isBuyer = transaction.buyerId.toString() === req.user.userId;
        isBuyer = isBuyer || transaction.sellerId.toString() === req.user.userId;
      }
    }
    
    if (!isSeller && !isBuyer) {
      return res.status(403).json({ 
        message: 'You must be the property owner or involved in the transaction to upload documents' 
      });
    }
    
    // Create document record
    const document = new Document({
      documentType,
      propertyId,
      transactionId: transactionId || null,
      userId: req.user.userId,
      title: title || documentType,
      description,
      province: province || property.province,
      fileName: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`, // Adjust based on your file serving
      fileType: path.extname(req.file.originalname).substring(1),
      fileSize: req.file.size,
      required: required === 'true',
      submittedViaEmail: submittedViaEmail === 'true',
      emailAddress: emailAddress || null,
      status: 'Submitted'
    });
    
    const savedDocument = await document.save();
    
    // TODO: Send email notification if submittedViaEmail is true
    // TODO: Notify other parties (buyer/seller) about document upload
    
    res.status(201).json({
      message: 'Document uploaded successfully',
      document: savedDocument
    });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ message: 'Error uploading document', error: err.message });
  }
});

/**
 * @route   POST /api/documents/submit-email
 * @desc    Submit document via email (email to platform, document attached)
 * @access  Public (via email endpoint)
 */
router.post('/submit-email', upload.single('document'), async (req, res) => {
  try {
    // This endpoint would typically be called by an email service/webhook
    // For now, we'll accept direct submissions
    
    const {
      propertyId,
      transactionId,
      documentType,
      emailAddress,
      title,
      description
    } = req.body;
    
    if (!req.file || !propertyId || !emailAddress) {
      return res.status(400).json({ 
        message: 'File, property ID, and email address are required' 
      });
    }
    
    // Find user by email
    const User = require('../models/User.model');
    const user = await User.findOne({ email: emailAddress });
    
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found with this email address' 
      });
    }
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const document = new Document({
      documentType: documentType || 'Other',
      propertyId,
      transactionId: transactionId || null,
      userId: user._id,
      title: title || `Document from ${emailAddress}`,
      description,
      province: property.province,
      fileName: req.file.originalname,
      fileUrl: `/uploads/documents/${req.file.filename}`,
      fileType: path.extname(req.file.originalname).substring(1),
      fileSize: req.file.size,
      submittedViaEmail: true,
      emailAddress,
      emailConfirmationSent: false,
      status: 'Submitted'
    });
    
    const savedDocument = await document.save();
    
    // TODO: Send confirmation email to submitter
    // TODO: Notify property owner/buyer about document submission
    
    res.status(201).json({
      message: 'Document submitted via email successfully',
      document: savedDocument,
      confirmation: 'Confirmation email will be sent'
    });
  } catch (err) {
    console.error('Error submitting document via email:', err);
    res.status(500).json({ message: 'Error submitting document', error: err.message });
  }
});

/**
 * @route   GET /api/documents/property/:propertyId
 * @desc    Get all documents for a property
 * @access  Private
 */
router.get('/property/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user has access (seller or buyer in transaction)
    const isSeller = property.sellerId.toString() === req.user.userId;
    
    if (!isSeller) {
      // Check if user is buyer in any transaction
      const transaction = await Transaction.findOne({
        propertyId,
        buyerId: req.user.userId,
        status: { $in: ['Offer Made', 'Offer Accepted', 'In Progress', 'Closing'] }
      });
      
      if (!transaction) {
        return res.status(403).json({ 
          message: 'Not authorized to view these documents' 
        });
      }
    }
    
    const documents = await Document.find({ propertyId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      propertyId,
      documents,
      count: documents.length
    });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
});

/**
 * @route   GET /api/documents/transaction/:transactionId
 * @desc    Get all documents for a transaction
 * @access  Private
 */
router.get('/transaction/:transactionId', authenticateToken, async (req, res) => {
  try {
    const { transactionId } = req.params;
    
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check if user is part of transaction
    if (transaction.buyerId.toString() !== req.user.userId && 
        transaction.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ 
        message: 'Not authorized to view these documents' 
      });
    }
    
    const documents = await Document.find({ transactionId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      transactionId,
      documents,
      count: documents.length
    });
  } catch (err) {
    console.error('Error fetching transaction documents:', err);
    res.status(500).json({ message: 'Error fetching documents', error: err.message });
  }
});

/**
 * @route   GET /api/documents/:id
 * @desc    Get single document
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('propertyId', 'title address')
      .populate('userId', 'name email')
      .populate('transactionId');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check authorization
    const property = await Property.findById(document.propertyId);
    if (property) {
      const isSeller = property.sellerId.toString() === req.user.userId;
      const isBuyer = document.transactionId ? 
        (await Transaction.findById(document.transactionId))?.buyerId.toString() === req.user.userId : false;
      
      if (!isSeller && !isBuyer && document.userId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized to view this document' });
      }
    }
    
    res.json(document);
  } catch (err) {
    console.error('Error fetching document:', err);
    res.status(500).json({ message: 'Error fetching document', error: err.message });
  }
});

/**
 * @route   PUT /api/documents/:id/status
 * @desc    Update document status
 * @access  Private
 */
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check authorization - only property owner or admin can update status
    const property = await Property.findById(document.propertyId);
    if (property && property.sellerId.toString() !== req.user.userId) {
      // TODO: Add admin check
      return res.status(403).json({ message: 'Not authorized to update this document' });
    }
    
    document.status = status;
    if (notes) document.reviewNotes = notes;
    document.reviewedBy = req.user.userId;
    document.reviewedDate = new Date();
    
    if (status === 'Approved') {
      document.approvedBy = req.user.userId;
      document.approvedDate = new Date();
      document.validated = true;
      document.validatedBy = req.user.userId;
      document.validatedDate = new Date();
    }
    
    await document.save();
    
    res.json({
      message: 'Document status updated',
      document
    });
  } catch (err) {
    console.error('Error updating document status:', err);
    res.status(500).json({ message: 'Error updating document status', error: err.message });
  }
});

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Only owner can delete
    if (document.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this document' });
    }
    
    // TODO: Delete actual file from storage
    
    await document.deleteOne();
    
    res.json({ message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ message: 'Error deleting document', error: err.message });
  }
});

module.exports = router;

