const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('crypto');

/**
 * Webhook Model - Store webhook configurations for external integrations
 */
const webhookSchema = new Schema({
  // Owner Information
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Webhook Configuration
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  
  // Webhook URL
  url: {
    type: String,
    required: true,
    trim: true
  },
  
  // Events to Subscribe To
  events: [{
    type: String,
    enum: [
      'property.created',
      'property.updated',
      'property.deleted',
      'transaction.created',
      'transaction.updated',
      'transaction.completed',
      'offer.made',
      'offer.accepted',
      'offer.rejected',
      'document.uploaded',
      'document.signed',
      'payment.completed',
      'user.registered',
      'review.created'
    ]
  }],
  
  // Security
  secret: {
    type: String,
    required: true,
    default: () => crypto.randomBytes(32).toString('hex')
  },
  headers: Schema.Types.Mixed, // Custom headers to send
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  
  // Retry Configuration
  retryConfig: {
    maxRetries: {
      type: Number,
      default: 3
    },
    retryDelay: {
      type: Number,
      default: 1000 // milliseconds
    }
  },
  
  // Statistics
  stats: {
    totalRequests: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    failureCount: {
      type: Number,
      default: 0
    },
    lastRequestAt: Date,
    lastSuccessAt: Date,
    lastFailureAt: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
webhookSchema.index({ userId: 1, isActive: 1 });
webhookSchema.index({ events: 1 });

const Webhook = mongoose.model('Webhook', webhookSchema);

module.exports = Webhook;

