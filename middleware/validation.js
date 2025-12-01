const { body, validationResult } = require('express-validator');
const { isValidProvince } = require('../config/provincialRegulations');

/**
 * Validation middleware wrapper
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

/**
 * Property validation rules
 */
const validateProperty = validate([
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 5, max: 200 }).withMessage('Title must be between 5 and 200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20, max: 10000 }).withMessage('Description must be between 20 and 10000 characters'),
  
  body('province')
    .notEmpty().withMessage('Province is required')
    .custom((value) => {
      if (!isValidProvince(value)) {
        throw new Error('Invalid province code');
      }
      return true;
    }),
  
  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('postalCode')
    .trim()
    .notEmpty().withMessage('Postal code is required')
    .matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/).withMessage('Invalid postal code format'),
  
  body('propertyType')
    .notEmpty().withMessage('Property type is required')
    .isIn(['Residential', 'Commercial', 'Land', 'Industrial', 'Mixed Use']).withMessage('Invalid property type'),
  
  body('listingType')
    .notEmpty().withMessage('Listing type is required')
    .isIn(['Sale', 'Rent']).withMessage('Listing type must be Sale or Rent'),
  
  body('price')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  
  body('address.street')
    .optional()
    .trim()
    .notEmpty().withMessage('Street address cannot be empty')
]);

/**
 * User registration validation
 */
const validateRegistration = validate([
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  
  body('province')
    .optional()
    .custom((value) => {
      if (value && !isValidProvince(value)) {
        throw new Error('Invalid province code');
      }
      return true;
    }),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/).withMessage('Invalid phone number format')
]);

/**
 * User login validation
 */
const validateLogin = validate([
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
]);

module.exports = {
  validate,
  validateProperty,
  validateRegistration,
  validateLogin
};

