const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Favorite Model - Users can favorite/bookmark properties
 */
const favoriteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  propertyId: {
    type: Schema.Types.ObjectId,
    ref: 'Property',
    required: true,
    index: true
  },
  
  // Metadata
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  tags: [String],
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicates
favoriteSchema.index({ userId: 1, propertyId: 1 }, { unique: true });
favoriteSchema.index({ createdAt: -1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;

