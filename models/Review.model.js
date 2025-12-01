const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Review Model - Property reviews and ratings
 */
const reviewSchema = new Schema({
  // Review Target
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  
  // Reviewer
  reviewerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Must have completed transaction to review
  transactionId: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  // Rating (1-5 stars)
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    index: true
  },
  
  // Review Content
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // Detailed Ratings (Optional)
  detailedRatings: {
    cleanliness: { type: Number, min: 1, max: 5 },
    accuracy: { type: Number, min: 1, max: 5 },
    value: { type: Number, min: 1, max: 5 },
    location: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 }
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  
  // Moderation
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Flagged'],
    default: 'Pending',
    index: true
  },
  moderationNotes: String,
  
  // Helpfulness
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Response from Property Owner
  ownerResponse: {
    message: String,
    respondedAt: Date,
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Flags
  isReported: {
    type: Boolean,
    default: false
  },
  reportReasons: [String],
  
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
reviewSchema.index({ propertyId: 1, status: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1, propertyId: 1 }, { unique: true });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ isVerified: 1 });

// Pre-save to verify transaction
reviewSchema.pre('save', async function(next) {
  if (this.isNew && this.transactionId) {
    const Transaction = require('./Transaction.model');
    const transaction = await Transaction.findById(this.transactionId);
    
    if (transaction && transaction.status === 'Completed') {
      this.verifiedPurchase = true;
      this.isVerified = true;
    }
  }
  next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

