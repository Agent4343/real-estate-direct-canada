const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Document Model - Stores required legal documents and forms for transactions
 * Handles property disclosures, agreements, and other mandatory documents
 */
const documentSchema = new Schema({
  // Document Identification
  documentType: {
    type: String,
    required: true,
    enum: [
      'Property Disclosure Statement',
      'Agreement of Purchase and Sale',
      'Latent Defects Disclosure',
      'Property Condition Disclosure',
      'Strata Documents',
      'Real Property Report',
      'Survey Certificate',
      'Inspection Report',
      'Tax Certificate',
      'Title Search',
      'Purchase Agreement',
      'Other'
    ]
  },
  
  // Associated Entities
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true // Who uploaded/submitted the document
  },
  
  // Document Details
  title: {
    type: String,
    required: true
  },
  description: String,
  province: {
    type: String,
    required: true,
    enum: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
  },
  
  // File Information
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true,
    enum: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt']
  },
  fileSize: {
    type: Number, // in bytes
    required: true
  },
  
  // Status and Compliance
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Expired'],
    default: 'Draft'
  },
  required: {
    type: Boolean,
    default: false
  },
  mandatoryForProvince: {
    type: Boolean,
    default: false
  },
  
  // Email Submission Details
  submittedViaEmail: {
    type: Boolean,
    default: false
  },
  emailAddress: String, // Email used for submission
  emailConfirmationSent: {
    type: Boolean,
    default: false
  },
  emailConfirmationDate: Date,
  
  // Validation
  validated: {
    type: Boolean,
    default: false
  },
  validatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  validatedDate: Date,
  validationNotes: String,
  
  // Electronic Signature (if applicable)
  signature: {
    required: Boolean,
    signed: Boolean,
    signedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    signedDate: Date,
    signatureType: {
      type: String,
      enum: ['Electronic', 'Digital', 'Scanned', 'DocuSign', 'None']
    },
    signatureData: String, // Base64 or reference to signature
    
    // DocuSign Integration
    docusign: {
      enabled: {
        type: Boolean,
        default: false
      },
      envelopeId: String,
      envelopeStatus: {
        type: String,
        enum: ['sent', 'delivered', 'signed', 'completed', 'declined', 'voided']
      },
      signingUrl: String,
      completedDate: Date,
      signers: [{
        email: String,
        name: String,
        status: {
          type: String,
          enum: ['sent', 'delivered', 'signed', 'declined', 'completed']
        },
        signedDate: Date,
        ipAddress: String
      }]
    }
  },
  
  // Expiration and Validity
  expiryDate: Date,
  validFrom: Date,
  validUntil: Date,
  
  // Review and Approval
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedDate: Date,
  reviewNotes: String,
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedDate: Date,
  
  // Recipients (who needs to see/receive this document)
  recipients: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String,
    role: {
      type: String,
      enum: ['Buyer', 'Seller', 'Lawyer', 'Other']
    },
    notified: {
      type: Boolean,
      default: false
    },
    notifiedDate: Date,
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedDate: Date
  }],
  
  // Version Control
  version: {
    type: Number,
    default: 1
  },
  previousVersion: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  isLatestVersion: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  tags: [String],
  notes: String,
  metadata: Schema.Types.Mixed, // For additional province-specific data
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
documentSchema.index({ propertyId: 1, documentType: 1 });
documentSchema.index({ transactionId: 1 });
documentSchema.index({ userId: 1 });
documentSchema.index({ province: 1, documentType: 1 });
documentSchema.index({ status: 1, required: 1 });
documentSchema.index({ expiryDate: 1 });

// Virtual for document age
documentSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

// Virtual for is expired
documentSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;

