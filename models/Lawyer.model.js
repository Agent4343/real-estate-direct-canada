const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Lawyer Model - Directory of real estate lawyers by location
 */
const lawyerSchema = new Schema({
  // Basic Information
  firmName: {
    type: String,
    required: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  // Contact Information
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  website: String,
  
  // Location Information
  province: {
    type: String,
    required: true,
    enum: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'],
    uppercase: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  postalCode: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String,
    country: {
      type: String,
      default: 'Canada'
    }
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  
  // Professional Information
  barNumber: {
    type: String,
    required: true
  },
  barAssociation: {
    type: String,
    required: true
  },
  licenseDate: Date,
  specialties: [{
    type: String,
    enum: [
      'Real Estate Law',
      'Property Law',
      'Commercial Real Estate',
      'Residential Real Estate',
      'Real Estate Litigation',
      'Mortgage Law',
      'Title Law'
    ]
  }],
  
  // Services Offered
  services: [{
    type: String,
    enum: [
      'Purchase/Sale Transactions',
      'Mortgage Closings',
      'Title Searches',
      'Property Transfers',
      'Real Estate Contracts',
      'Property Disputes',
      'Condominium Law',
      'Commercial Leases'
    ]
  }],
  
  // Pricing Information
  consultationFee: {
    type: Number,
    min: 0
  },
  typicalFeeRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'CAD'
    }
  },
  feeStructure: {
    type: String,
    enum: ['Fixed Fee', 'Hourly', 'Percentage', 'Flat + Variable']
  },
  
  // Availability
  availability: {
    type: String,
    enum: ['Available', 'Limited', 'Unavailable'],
    default: 'Available'
  },
  languages: [{
    type: String
  }],
  
  // Ratings and Reviews
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  reviews: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Verification
  verified: {
    type: Boolean,
    default: false
  },
  verifiedDate: Date,
  verificationDocuments: [{
    type: String,
    url: String
  }],
  
  // Experience
  yearsOfExperience: {
    type: Number,
    min: 0
  },
  transactionsCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending Verification'],
    default: 'Pending Verification'
  },
  
  // Metadata
  bio: String,
  photo: String,
  featured: {
    type: Boolean,
    default: false
  },
  clicks: {
    type: Number,
    default: 0
  },
  inquiries: {
    type: Number,
    default: 0
  },
  
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
lawyerSchema.index({ province: 1, city: 1 });
lawyerSchema.index({ province: 1, status: 1 });
lawyerSchema.index({ coordinates: '2dsphere' });
lawyerSchema.index({ rating: -1 });
lawyerSchema.index({ verified: 1, status: 1 });

// Virtual for full name
lawyerSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Static method to find lawyers by location
lawyerSchema.statics.findByLocation = function(province, city, options = {}) {
  const query = {
    province: province.toUpperCase(),
    status: 'Active',
    verified: true
  };
  
  if (city) {
    query.city = new RegExp(city, 'i');
  }
  
  return this.find(query)
    .sort({ rating: -1, transactionsCompleted: -1 })
    .limit(options.limit || 20);
};

// Static method to find nearest lawyers
lawyerSchema.statics.findNearest = function(latitude, longitude, maxDistance = 50000) {
  return this.find({
    coordinates: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        $maxDistance: maxDistance // in meters
      }
    },
    status: 'Active',
    verified: true
  }).limit(10);
};

const Lawyer = mongoose.model('Lawyer', lawyerSchema);

module.exports = Lawyer;

