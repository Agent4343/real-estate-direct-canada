const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Mortgage Model - Stores mortgage offers from banks/financial institutions
 */
const mortgageSchema = new Schema({
  // Bank/Institution Information
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  bankCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  logo: String,
  website: String,
  contactInfo: {
    phone: String,
    email: String,
    branchLocations: [{
      address: String,
      city: String,
      province: String,
      postalCode: String,
      phone: String
    }]
  },
  
  // Mortgage Details
  mortgageType: {
    type: String,
    enum: ['Fixed Rate', 'Variable Rate', 'Open', 'Closed', 'Convertible'],
    required: true
  },
  term: {
    type: Number,
    required: true, // in months (e.g., 60 for 5 years)
    min: 1,
    max: 360
  },
  amortizationPeriod: {
    type: Number,
    required: true, // in years
    min: 1,
    max: 30
  },
  
  // Rates
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  comparisonRate: {
    type: Number, // APR equivalent for comparison
    min: 0,
    max: 100
  },
  
  // Eligibility Requirements
  minDownPayment: {
    type: Number,
    required: true,
    min: 0,
    max: 100 // as percentage
  },
  maxLoanAmount: {
    type: Number,
    min: 0
  },
  minCreditScore: {
    type: Number,
    min: 300,
    max: 900
  },
  
  // Features
  features: [{
    type: String // e.g., "Prepayment Options", "Portable", "Blend and Extend"
  }],
  prepaymentOptions: {
    allowed: Boolean,
    percentage: Number, // e.g., 20% of principal per year
    details: String
  },
  
  // Fees
  applicationFee: {
    type: Number,
    default: 0,
    min: 0
  },
  appraisalFee: {
    type: Number,
    default: 0,
    min: 0
  },
  legalFees: {
    type: Number,
    default: 0,
    min: 0
  },
  totalFees: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Availability
  provinces: [{
    type: String,
    enum: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
  }],
  available: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: Date,
  
  // Mortgage Insurance
  requiresCMHC: {
    type: Boolean,
    default: false
  },
  cmhcPremium: {
    type: Number,
    min: 0,
    max: 100 // as percentage of loan amount
  },
  
  // Status and Metadata
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Expired'],
    default: 'Active'
  },
  priority: {
    type: Number,
    default: 0 // for sorting/ranking
  },
  clicks: {
    type: Number,
    default: 0
  },
  applications: {
    type: Number,
    default: 0
  },
  
  // Additional Information
  description: String,
  termsAndConditions: String,
  specialOffers: String,
  
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
mortgageSchema.index({ bankName: 1 });
mortgageSchema.index({ provinces: 1 });
mortgageSchema.index({ status: 1, available: 1 });
mortgageSchema.index({ interestRate: 1 });
mortgageSchema.index({ priority: -1, interestRate: 1 });

// Virtual for display term (e.g., "5 years" from 60 months)
mortgageSchema.virtual('termYears').get(function() {
  return (this.term / 12).toFixed(1);
});

// Static method to find best mortgages
mortgageSchema.statics.findBestMortgages = function(province, loanAmount, downPayment, options = {}) {
  const query = {
    provinces: province.toUpperCase(),
    status: 'Active',
    available: true,
    validFrom: { $lte: new Date() }
  };
  
  if (options.validUntil) {
    query.validUntil = { $gte: new Date() };
  }
  
  if (loanAmount && this.maxLoanAmount) {
    query.maxLoanAmount = { $gte: loanAmount };
  }
  
  return this.find(query)
    .sort({ priority: -1, interestRate: 1 })
    .limit(options.limit || 10);
};

const Mortgage = mongoose.model('Mortgage', mortgageSchema);

module.exports = Mortgage;

