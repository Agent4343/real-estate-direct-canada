const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { getProvinceCodes } = require('../config/provincialRegulations');

const { Schema } = mongoose;
const SALT_ROUNDS = 10;
const DEFAULT_PROVINCE_CODES = ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU'];
const PROVINCE_CODES = typeof getProvinceCodes === 'function'
  ? getProvinceCodes()
  : DEFAULT_PROVINCE_CODES;

const notificationPreferencesSchema = new Schema({
  email: { type: Boolean, default: true },
  sms: { type: Boolean, default: false },
  push: { type: Boolean, default: false }
}, { _id: false });

const termsAcceptedSchema = new Schema({
  tos: { type: Boolean, default: false },
  tosVersion: { type: String, default: null },
  tosAcceptedDate: { type: Date, default: null },
  privacyPolicy: { type: Boolean, default: false },
  privacyPolicyVersion: { type: String, default: null },
  privacyPolicyAcceptedDate: { type: Date, default: null }
}, { _id: false });

const provinceAcknowledgmentSchema = new Schema({
  acknowledged: { type: Boolean, default: false },
  version: { type: String, default: '1.0.0' },
  acknowledgedDate: { type: Date, default: null },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

const addressSchema = new Schema({
  street: { type: String, trim: true },
  unit: { type: String, trim: true },
  city: { type: String, trim: true },
  province: { type: String, uppercase: true },
  postalCode: { type: String, trim: true },
  country: { type: String, default: 'Canada' }
}, { _id: false });

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['Buyer', 'Seller', 'Lawyer', 'Admin', 'Moderator'],
    default: 'Buyer'
  },
  status: {
    type: String,
    enum: ['Pending Verification', 'Active', 'Suspended', 'Inactive'],
    default: 'Active'
  },
  phone: {
    type: String,
    trim: true
  },
  province: {
    type: String,
    uppercase: true,
    enum: PROVINCE_CODES,
    required: false
  },
  city: {
    type: String,
    trim: true
  },
  postalCode: {
    type: String,
    trim: true
  },
  address: addressSchema,
  companyName: { type: String, trim: true },
  licenseNumber: { type: String, trim: true },
  practiceAreas: [{ type: String }],
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  verificationTokenExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  marketingOptIn: { type: Boolean, default: false },
  notificationPreferences: {
    type: notificationPreferencesSchema,
    default: () => ({})
  },
  termsAccepted: {
    type: termsAcceptedSchema,
    default: () => ({})
  },
  provinceRegulationAcknowledgment: {
    type: Map,
    of: provinceAcknowledgmentSchema,
    default: () => new Map()
  },
  complianceStatus: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  kyc: {
    verified: { type: Boolean, default: false },
    documentType: { type: String },
    documentUrl: { type: String },
    verifiedAt: { type: Date }
  },
  preferences: {
    receiveMarketUpdates: { type: Boolean, default: true },
    receiveRegulationAlerts: { type: Boolean, default: true }
  },
  analytics: {
    lastActiveAt: { type: Date },
    device: { type: String },
    ipAddress: { type: String }
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.verificationToken;
      delete ret.verificationTokenExpires;
      return ret;
    }
  },
  toObject: {
    virtuals: true,
    transform: (_, ret) => {
      delete ret.password;
      delete ret.resetPasswordToken;
      delete ret.resetPasswordExpires;
      delete ret.verificationToken;
      delete ret.verificationTokenExpires;
      return ret;
    }
  }
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ province: 1 });
userSchema.index({ createdAt: -1 });

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  if (!candidatePassword) {
    return Promise.resolve(false);
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.acceptTerms = function acceptTerms(version = '1.0.0') {
  if (!this.termsAccepted) {
    this.termsAccepted = {};
  }

  this.termsAccepted.tos = true;
  this.termsAccepted.tosVersion = version;
  this.termsAccepted.tosAcceptedDate = new Date();
};

userSchema.methods.acknowledgeProvinceRegulation = function acknowledgeProvinceRegulation(provinceCode, version = '1.0.0') {
  if (!provinceCode) {
    throw new Error('Province code is required');
  }

  const normalizedProvince = provinceCode.toUpperCase();
  if (Array.isArray(PROVINCE_CODES) && PROVINCE_CODES.length && !PROVINCE_CODES.includes(normalizedProvince)) {
    throw new Error('Invalid province code');
  }

  if (!this.provinceRegulationAcknowledgment) {
    this.provinceRegulationAcknowledgment = new Map();
  }

  this.provinceRegulationAcknowledgment.set(normalizedProvince, {
    acknowledged: true,
    version,
    acknowledgedDate: new Date(),
    updatedAt: new Date()
  });

  return this.provinceRegulationAcknowledgment.get(normalizedProvince);
};

userSchema.methods.isLocked = function isLocked() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

userSchema.methods.recordSuccessfulLogin = function recordSuccessfulLogin() {
  this.lastLogin = new Date();
  this.loginCount += 1;
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
