const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Audit Log Model - Tracks all platform activities for compliance
 * Critical for legal protection and regulatory compliance
 */
const auditLogSchema = new Schema({
  // Event Information
  eventType: {
    type: String,
    required: true,
    enum: [
      // User Events
      'USER_REGISTERED',
      'USER_LOGIN',
      'USER_LOGOUT',
      'USER_UPDATED',
      'USER_VERIFIED',
      
      // Property Events
      'PROPERTY_CREATED',
      'PROPERTY_UPDATED',
      'PROPERTY_DELETED',
      'PROPERTY_VIEWED',
      
      // Transaction Events
      'OFFER_MADE',
      'OFFER_ACCEPTED',
      'OFFER_REJECTED',
      'OFFER_WITHDRAWN',
      'TRANSACTION_COMPLETED',
      'TRANSACTION_CANCELLED',
      
      // Document Events
      'DOCUMENT_UPLOADED',
      'DOCUMENT_SUBMITTED',
      'DOCUMENT_APPROVED',
      'DOCUMENT_REJECTED',
      'DOCUMENT_SIGNED',
      'DOCUMENT_DOWNLOADED',
      
      // Legal Events
      'TERMS_ACCEPTED',
      'PRIVACY_ACCEPTED',
      'PROVINCE_ACKNOWLEDGED',
      
      // Payment Events
      'PAYMENT_INITIATED',
      'PAYMENT_COMPLETED',
      'PAYMENT_FAILED',
      'REFUND_ISSUED',
      
      // Admin Events
      'ADMIN_ACTION',
      'SETTINGS_UPDATED',
      'USER_SUSPENDED',
      'USER_REACTIVATED',
      
      // Security Events
      'LOGIN_ATTEMPT_FAILED',
      'UNAUTHORIZED_ACCESS',
      'RATE_LIMIT_EXCEEDED'
    ]
  },
  
  // Actor Information
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,
  userRole: String,
  ipAddress: String,
  userAgent: String,
  
  // Target Information
  targetType: {
    type: String,
    enum: ['Property', 'Transaction', 'Document', 'User', 'Mortgage', 'Lawyer', 'System', 'Other']
  },
  targetId: Schema.Types.ObjectId,
  
  // Event Details
  description: {
    type: String,
    required: true
  },
  details: Schema.Types.Mixed, // Flexible object for event-specific data
  
  // Status
  status: {
    type: String,
    enum: ['Success', 'Failed', 'Pending', 'Error'],
    default: 'Success'
  },
  errorMessage: String,
  
  // Compliance
  province: String,
  regulatoryBody: String,
  complianceRelevant: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  requestId: String, // For tracking related requests
  sessionId: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Retention
  retentionPeriod: {
    type: Number,
    default: 2555 // 7 years in days (compliance requirement)
  },
  expiresAt: Date
}, {
  timestamps: true
});

// Indexes for performance
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ eventType: 1, timestamp: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ province: 1, timestamp: -1 });
auditLogSchema.index({ complianceRelevant: 1, timestamp: -1 });

// Pre-save middleware to set expiration
auditLogSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    this.expiresAt = new Date();
    this.expiresAt.setDate(this.expiresAt.getDate() + this.retentionPeriod);
  }
  next();
});

// Static method to create audit log entry
auditLogSchema.statics.log = async function(eventData) {
  try {
    const auditLog = new this({
      ...eventData,
      timestamp: new Date()
    });
    return await auditLog.save();
  } catch (err) {
    console.error('Error creating audit log:', err);
    // Don't throw - audit logging should not break main functionality
    return null;
  }
};

// Static method to get compliance logs
auditLogSchema.statics.getComplianceLogs = function(province, startDate, endDate) {
  const query = {
    complianceRelevant: true,
    timestamp: {
      $gte: startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last year
      $lte: endDate || new Date()
    }
  };
  
  if (province) {
    query.province = province;
  }
  
  return this.find(query).sort({ timestamp: -1 });
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

