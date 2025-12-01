const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Transaction Model - Handles buying/selling transactions
 * Replaces rental model with comprehensive transaction tracking
 */
const transactionSchema = new Schema({
  // Parties
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true
  },
  
  // Transaction Details
  transactionType: {
    type: String,
    enum: ['Sale', 'Rent'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'Offer Made',
      'Offer Accepted',
      'Offer Rejected',
      'Under Review',
      'Conditions Waived',
      'Deposit Paid',
      'In Progress',
      'Closing',
      'Completed',
      'Cancelled',
      'Failed'
    ],
    default: 'Offer Made'
  },
  
  // Financial Details
  offerPrice: {
    type: Number,
    required: true,
    min: 0
  },
  finalPrice: Number,
  depositAmount: {
    type: Number,
    min: 0
  },
  depositPaid: {
    type: Boolean,
    default: false
  },
  depositPaidDate: Date,
  
  // Dates
  offerDate: {
    type: Date,
    default: Date.now
  },
  acceptanceDate: Date,
  closingDate: Date,
  completionDate: Date,
  coolingOffPeriodEnd: Date,
  
  // Offer Terms
  conditions: [{
    type: {
      type: String,
      enum: ['Financing', 'Inspection', 'Sale of Property', 'Other']
    },
    description: String,
    status: {
      type: String,
      enum: ['Pending', 'Waived', 'Fulfilled', 'Failed'],
      default: 'Pending'
    },
    deadline: Date,
    fulfilledDate: Date
  }],
  conditionsDeadline: Date,
  
  // Financing
  financingPreApproved: {
    type: Boolean,
    default: false
  },
  mortgageId: {
    type: Schema.Types.ObjectId,
    ref: 'Mortgage'
  },
  
  // Legal
  lawyerId: {
    type: Schema.Types.ObjectId,
    ref: 'Lawyer'
  },
  legalDocumentation: {
    purchaseAgreement: {
      signed: Boolean,
      signedDate: Date,
      documentUrl: String
    },
    disclosures: [{
      type: String,
      acknowledged: Boolean,
      acknowledgedDate: Date
    }]
  },
  
  // Provincial Compliance
  province: {
    type: String,
    required: true
  },
  complianceStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Non-Compliant'],
    default: 'Not Started'
  },
  complianceChecks: [{
    requirement: String,
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Pending'
    },
    completedDate: Date,
    notes: String
  }],
  
  // Communication
  messages: [{
    from: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Payment Tracking
  payments: [{
    type: {
      type: String,
      enum: ['Deposit', 'Final Payment', 'Other']
    },
    amount: Number,
    method: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    date: Date,
    notes: String
  }],
  
  // Platform Fees
  platformFees: {
    listingFee: {
      amount: Number,
      paid: {
        type: Boolean,
        default: false
      },
      paidDate: Date,
      transactionId: String
    },
    successFee: {
      amount: Number,
      percentage: Number,
      calculated: Boolean,
      paid: {
        type: Boolean,
        default: false
      },
      paidDate: Date,
      transactionId: String
    },
    totalFee: Number,
    feeModel: {
      type: String,
      enum: ['flat', 'percentage', 'tiered', 'hybrid'],
      default: 'hybrid'
    },
    payableBy: {
      type: String,
      enum: ['seller', 'buyer', 'both'],
      default: 'seller'
    }
  },
  
  // Notes and History
  notes: [{
    note: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Audit Trail
  statusHistory: [{
    status: String,
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    reason: String
  }],
  
  // Metadata
  cancellationReason: String,
  cancellationDate: Date,
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
transactionSchema.index({ buyerId: 1, status: 1 });
transactionSchema.index({ sellerId: 1, status: 1 });
transactionSchema.index({ propertyId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ createdAt: -1 });

// Pre-save middleware to track status changes
transactionSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: Date.now(),
      reason: 'Status updated'
    });
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

