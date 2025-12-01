const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Saved Search Model - Users can save search criteria for notifications
 */
const savedSearchSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Search Criteria
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  searchCriteria: {
    province: String,
    city: String,
    propertyType: String,
    listingType: String,
    minPrice: Number,
    maxPrice: Number,
    bedrooms: Number,
    bathrooms: Number,
    minSquareFeet: Number,
    maxSquareFeet: Number,
    features: [String],
    keywords: String
  },
  
  // Notification Settings
  emailNotifications: {
    type: Boolean,
    default: true
  },
  notificationFrequency: {
    type: String,
    enum: ['Immediate', 'Daily', 'Weekly'],
    default: 'Daily'
  },
  lastNotificationSent: Date,
  
  // Statistics
  matchCount: {
    type: Number,
    default: 0
  },
  lastMatchDate: Date,
  
  // Status
  isActive: {
    type: Boolean,
    default: true
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
savedSearchSchema.index({ userId: 1, isActive: 1 });
savedSearchSchema.index({ 'searchCriteria.province': 1 });
savedSearchSchema.index({ createdAt: -1 });

const SavedSearch = mongoose.model('SavedSearch', savedSearchSchema);

module.exports = SavedSearch;

