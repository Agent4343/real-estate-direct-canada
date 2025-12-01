const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Webhook Event Model - Track webhook delivery attempts
 */
const webhookEventSchema = new Schema({
  webhookId: {
    type: Schema.Types.ObjectId,
    ref: 'Webhook',
    required: true,
    index: true
  },
  
  eventType: {
    type: String,
    required: true
  },
  
  // Payload
  payload: Schema.Types.Mixed,
  
  // Delivery Status
  status: {
    type: String,
    enum: ['Pending', 'Sent', 'Failed', 'Retrying'],
    default: 'Pending',
    index: true
  },
  
  // HTTP Response
  response: {
    statusCode: Number,
    headers: Schema.Types.Mixed,
    body: String,
    receivedAt: Date
  },
  
  // Retry Information
  retryCount: {
    type: Number,
    default: 0
  },
  nextRetryAt: Date,
  
  // Error Information
  error: {
    message: String,
    code: String,
    stack: String
  },
  
  // Timing
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  sentAt: Date,
  completedAt: Date
}, {
  timestamps: true
});

// Indexes
webhookEventSchema.index({ webhookId: 1, status: 1, createdAt: -1 });
webhookEventSchema.index({ eventType: 1, status: 1 });
webhookEventSchema.index({ nextRetryAt: 1 });

const WebhookEvent = mongoose.model('WebhookEvent', webhookEventSchema);

module.exports = WebhookEvent;

