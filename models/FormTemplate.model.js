const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Form Template Model - Stores standardized form templates by province
 * Provides province-specific required forms for real estate transactions
 */
const formTemplateSchema = new Schema({
  // Form Identification
  formName: {
    type: String,
    required: true,
    unique: true
  },
  formCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  
  // Province and Type
  province: {
    type: String,
    required: true,
    enum: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU', 'ALL']
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      'Property Disclosure Statement',
      'Agreement of Purchase and Sale',
      'Latent Defects Disclosure',
      'Property Condition Disclosure',
      'Strata Documents',
      'Real Property Report',
      'Survey Certificate',
      'Inspection Report',
      'Tax Certificate',
      'Title Search',
      'Purchase Agreement'
    ]
  },
  
  // Form Details
  title: {
    type: String,
    required: true
  },
  description: String,
  purpose: String,
  
  // Form Structure
  formFields: [{
    fieldName: {
      type: String,
      required: true
    },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date', 'boolean', 'textarea', 'file', 'select'],
      required: true
    },
    label: String,
    placeholder: String,
    required: Boolean,
    validation: {
      min: Number,
      max: Number,
      pattern: String,
      options: [String]
    },
    order: Number
  }],
  
  // Requirements
  mandatory: {
    type: Boolean,
    default: false
  },
  whenRequired: {
    type: String,
    enum: ['Before Listing', 'Before Offer', 'Before Acceptance', 'Before Closing', 'Always']
  },
  requiredFor: {
    type: String,
    enum: ['Seller', 'Buyer', 'Both']
  },
  
  // Legal Requirements
  legalRequirement: {
    type: Boolean,
    default: false
  },
  regulatoryBody: String,
  reference: String, // Link to regulation
  
  // Form File
  templateFile: {
    url: String,
    fileName: String,
    fileType: String
  },
  
  // Status
  active: {
    type: Boolean,
    default: true
  },
  version: {
    type: Number,
    default: 1
  },
  
  // Metadata
  lastUpdated: Date,
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String
}, {
  timestamps: true
});

// Indexes
formTemplateSchema.index({ province: 1, documentType: 1 });
formTemplateSchema.index({ mandatory: 1, active: 1 });
formTemplateSchema.index({ formCode: 1 });

const FormTemplate = mongoose.model('FormTemplate', formTemplateSchema);

module.exports = FormTemplate;

