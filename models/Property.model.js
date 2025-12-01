const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Property Model - Enhanced for Canadian real estate buying/selling
 * Replaces the old Item model with comprehensive property information
 */
const propertySchema = new Schema({
  // Basic Information
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 10000
  },
  
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
    required: true,
    match: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  },
  address: {
    street: {
      type: String,
      required: true
    },
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
  neighborhood: String,
  
  // Property Details
  propertyType: {
    type: String,
    required: true,
    enum: ['Residential', 'Commercial', 'Land', 'Industrial', 'Mixed Use']
  },
  listingType: {
    type: String,
    required: true,
    enum: ['Sale', 'Rent']
  },
  
  // Pricing
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'CAD'
  },
  
  // Property Specifications
  squareFootage: {
    type: Number,
    min: 0
  },
  lotSize: {
    type: Number,
    min: 0
  },
  bedrooms: {
    type: Number,
    min: 0,
    default: 0
  },
  bathrooms: {
    type: Number,
    min: 0,
    default: 0
  },
  yearBuilt: Number,
  propertyTaxes: Number,
  
  // Property Features
  features: [{
    type: String
  }],
  amenities: [{
    type: String
  }],
  
  // Media
  images: [{
    url: String,
    caption: String,
    order: Number
  }],
  virtualTourUrl: String,
  
  // Listing Information
  listingDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Sold', 'Rented', 'Expired', 'Cancelled'],
    default: 'Active'
  },
  
  // Seller Information
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerContact: {
    email: String,
    phone: String,
    showContact: {
      type: Boolean,
      default: false
    }
  },
  
  // Regulatory Compliance
  regulatoryCompliance: {
    province: String,
    disclosuresCompleted: {
      type: Boolean,
      default: false
    },
    disclosureDate: Date,
    complianceChecks: [{
      requirement: String,
      completed: Boolean,
      completedDate: Date,
      documentUrl: String
    }],
    regulatoryBody: String
  },
  
  // Legal Documents
  documentation: {
    propertySurvey: {
      required: Boolean,
      provided: Boolean,
      documentUrl: String
    },
    inspectionReports: {
      required: Boolean,
      provided: Boolean,
      reports: [{
        type: String,
        url: String,
        date: Date
      }]
    },
    permits: [{
      type: String,
      number: String,
      description: String
    }],
    warranties: [{
      type: String,
      provider: String,
      expiryDate: Date
    }]
  },
  
  // Transaction Details
  depositRequired: {
    type: Number,
    min: 0
  },
  coolingOffPeriod: {
    type: Number,
    default: 7
  },
  
  // Viewing and Interest
  viewCount: {
    type: Number,
    default: 0
  },
  interestCount: {
    type: Number,
    default: 0
  },
  
  // Ratings and Reviews
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    distribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  
  // MLS Integration (optional)
  MLSNumber: String,
  
  // Metadata
  tags: [String],
  featured: {
    type: Boolean,
    default: false
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

// Indexes for performance
propertySchema.index({ province: 1, city: 1 });
propertySchema.index({ province: 1, status: 1 });
propertySchema.index({ sellerId: 1 });
propertySchema.index({ listingType: 1, status: 1 });
propertySchema.index({ price: 1 });
propertySchema.index({ coordinates: '2dsphere' });
propertySchema.index({ createdAt: -1 });

// Virtual for property age
propertySchema.virtual('age').get(function() {
  if (!this.yearBuilt) return null;
  return new Date().getFullYear() - this.yearBuilt;
});

// Virtual for price per square foot
propertySchema.virtual('pricePerSqFt').get(function() {
  if (!this.price || !this.squareFootage || this.squareFootage === 0) return null;
  return (this.price / this.squareFootage).toFixed(2);
});

// Pre-save middleware
propertySchema.pre('save', function(next) {
  // Auto-populate address fields if not provided
  if (!this.address.city) {
    this.address.city = this.city;
  }
  if (!this.address.province) {
    this.address.province = this.province;
  }
  if (!this.address.postalCode) {
    this.address.postalCode = this.postalCode;
  }
  
  this.updatedAt = Date.now();
  next();
});

const Property = mongoose.model('Property', propertySchema);

module.exports = Property;

