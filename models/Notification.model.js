const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Notification Model - In-app notifications for users
 */
const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Notification Content
  type: {
    type: String,
    required: true,
    enum: [
      'NewOffer',
      'OfferAccepted',
      'OfferRejected',
      'OfferWithdrawn',
      'NewMessage',
      'PropertyUpdate',
      'NewMatch',
      'DocumentRequired',
      'DocumentApproved',
      'TransactionUpdate',
      'PaymentReceived',
      'System'
    ]
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Related Entities
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property'
  },
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  documentId: {
    type: Schema.Types.ObjectId,
    ref: 'Document'
  },
  
  // Status
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  readAt: Date,
  
  // Action Link
  actionUrl: String,
  
  // Priority
  priority: {
    type: String,
    enum: ['Low', 'Normal', 'High', 'Urgent'],
    default: 'Normal'
  },
  
  // Expiration
  expiresAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

