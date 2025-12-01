const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Analytics Model - Track platform usage and metrics
 */
const analyticsSchema = new Schema({
  // Event Information
  eventType: {
    type: String,
    required: true,
    enum: [
      'page_view',
      'property_view',
      'property_search',
      'property_favorite',
      'offer_made',
      'user_registration',
      'user_login',
      'document_upload',
      'mortgage_view',
      'lawyer_view',
      'transaction_completed',
      'payment_processed'
    ],
    index: true
  },
  
  // User Information
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  sessionId: String,
  
  // Related Entities
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property'
  },
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  // Event Data
  metadata: Schema.Types.Mixed,
  
  // Technical Information
  ipAddress: String,
  userAgent: String,
  referrer: String,
  url: String,
  
  // Geographic Information
  province: String,
  city: String,
  country: {
    type: String,
    default: 'Canada'
  },
  
  // Device Information
  device: {
    type: String,
    enum: ['Desktop', 'Mobile', 'Tablet', 'Unknown']
  },
  browser: String,
  os: String,
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes for common queries
analyticsSchema.index({ eventType: 1, timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ propertyId: 1, timestamp: -1 });
analyticsSchema.index({ province: 1, timestamp: -1 });
analyticsSchema.index({ timestamp: -1 });

// Compound indexes for analytics queries
analyticsSchema.index({ eventType: 1, province: 1, timestamp: -1 });
analyticsSchema.index({ eventType: 1, device: 1, timestamp: -1 });

const Analytics = mongoose.model('Analytics', analyticsSchema);

module.exports = Analytics;

