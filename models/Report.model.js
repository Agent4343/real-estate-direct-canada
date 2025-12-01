const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Report Model - User reports for properties, users, or content
 */
const reportSchema = new Schema({
  // Reporter
  reporterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Report Type
  reportType: {
    type: String,
    required: true,
    enum: [
      'Property',
      'User',
      'Review',
      'Message',
      'Transaction',
      'Document',
      'Other'
    ],
    index: true
  },
  
  // Reported Entity
  reportedId: {
    type: Schema.Types.ObjectId,
    required: true,
    index: true
  },
  reportedType: {
    type: String,
    enum: ['Property', 'User', 'Review', 'Message', 'Transaction', 'Document']
  },
  
  // Reason
  reason: {
    type: String,
    required: true,
    enum: [
      'Spam',
      'Fraud',
      'Inappropriate Content',
      'Misleading Information',
      'Harassment',
      'False Listing',
      'Duplicate',
      'Other'
    ]
  },
  
  // Details
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Evidence
  evidence: {
    screenshots: [String],
    links: [String],
    documents: [String]
  },
  
  // Status
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Resolved', 'Dismissed', 'Escalated'],
    default: 'Pending',
    index: true
  },
  
  // Resolution
  resolution: {
    action: {
      type: String,
      enum: ['Warning', 'Content Removed', 'User Suspended', 'User Banned', 'No Action', 'Escalated']
    },
    notes: String,
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal',
    index: true
  },
  
  // Admin Notes
  adminNotes: [{
    note: String,
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up
  requiresFollowUp: {
    type: Boolean,
    default: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ status: 1, priority: 1, createdAt: -1 });
reportSchema.index({ reportType: 1, reportedId: 1 });
reportSchema.index({ reporterId: 1, createdAt: -1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;

