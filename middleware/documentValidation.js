/**
 * Document Validation Middleware
 * Validates documents against provincial requirements and form completeness
 */

const { getProvincialRegulations } = require('../config/provincialRegulations');
const FormTemplate = require('../models/FormTemplate.model');

/**
 * Validate document against province requirements
 */
async function validateDocumentAgainstProvince(document, province) {
  const regulations = getProvincialRegulations(province);
  const errors = [];
  const warnings = [];
  
  if (!regulations) {
    return {
      valid: false,
      errors: ['Invalid province code'],
      warnings: []
    };
  }
  
  // Check if document type is required for this province
  const mandatoryDisclosures = regulations.mandatoryDisclosures || [];
  const isMandatory = mandatoryDisclosures.some(disclosure => 
    document.documentType.includes(disclosure) || 
    disclosure.includes(document.documentType)
  );
  
  if (isMandatory && !document.required) {
    warnings.push(`${document.documentType} is typically required in ${regulations.name}`);
  }
  
  // Check expiry date for time-sensitive documents
  if (document.expiryDate && new Date() > document.expiryDate) {
    errors.push('Document has expired');
  }
  
  // Check if signature is required
  if (document.documentType === 'Agreement of Purchase and Sale' && !document.signature?.signed) {
    errors.push('Purchase Agreement requires signatures from all parties');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    regulations
  };
}

/**
 * Validate document completeness
 */
async function validateDocumentCompleteness(document) {
  const errors = [];
  const warnings = [];
  
  // Check required fields
  if (!document.fileUrl) {
    errors.push('Document file is required');
  }
  
  if (!document.title) {
    errors.push('Document title is required');
  }
  
  if (!document.documentType) {
    errors.push('Document type is required');
  }
  
  // Check file size (should be validated at upload, but double-check)
  if (document.fileSize > 10 * 1024 * 1024) { // 10MB
    errors.push('File size exceeds 10MB limit');
  }
  
  // Check file type
  const allowedTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'txt'];
  if (!allowedTypes.includes(document.fileType?.toLowerCase())) {
    errors.push('Invalid file type');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check if all required documents are submitted for a property
 */
async function checkRequiredDocumentsForProperty(propertyId, province) {
  try {
    const Document = require('../models/Document.model');
    const regulations = getProvincialRegulations(province);
    
    if (!regulations) {
      return {
        complete: false,
        missing: [],
        submitted: []
      };
    }
    
    // Get required document types for this province
    const requiredTypes = regulations.mandatoryDisclosures || [];
    
    // Get submitted documents
    const submittedDocs = await Document.find({
      propertyId,
      status: { $in: ['Submitted', 'Approved'] }
    });
    
    const submittedTypes = submittedDocs.map(doc => doc.documentType);
    
    // Check what's missing
    const missing = requiredTypes.filter(required => 
      !submittedTypes.some(submitted => 
        submitted.includes(required) || required.includes(submitted)
      )
    );
    
    return {
      complete: missing.length === 0,
      missing,
      submitted: submittedTypes,
      required: requiredTypes
    };
  } catch (err) {
    console.error('Error checking required documents:', err);
    return {
      complete: false,
      missing: [],
      submitted: [],
      error: err.message
    };
  }
}

/**
 * Validate document submission middleware
 */
const validateDocumentSubmission = async (req, res, next) => {
  try {
    const { documentType, propertyId, province } = req.body;
    
    if (!documentType || !propertyId) {
      return res.status(400).json({
        message: 'Document type and property ID are required'
      });
    }
    
    // Get property to determine province if not provided
    const Property = require('../models/Property.model');
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const propertyProvince = province || property.province;
    
    // Validate against province requirements
    const validation = await validateDocumentAgainstProvince(
      { documentType, province: propertyProvince },
      propertyProvince
    );
    
    if (!validation.valid) {
      return res.status(400).json({
        message: 'Document validation failed',
        errors: validation.errors,
        warnings: validation.warnings
      });
    }
    
    req.documentValidation = validation;
    req.propertyProvince = propertyProvince;
    next();
  } catch (err) {
    console.error('Error validating document submission:', err);
    res.status(500).json({
      message: 'Error validating document',
      error: err.message
    });
  }
};

module.exports = {
  validateDocumentAgainstProvince,
  validateDocumentCompleteness,
  checkRequiredDocumentsForProperty,
  validateDocumentSubmission
};

