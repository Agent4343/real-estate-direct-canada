const { getProvincialRegulations } = require('../config/provincialRegulations');

/**
 * Compliance Middleware
 * Ensures transactions and listings comply with provincial regulations
 */

/**
 * Check if user has acknowledged province regulations
 */
const checkProvinceAcknowledgment = async (req, res, next) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const province = req.body.province || req.params.province;
    
    if (!province) {
      return next(); // No province specified, skip check
    }

    const acknowledgment = user.provinceRegulationAcknowledgment.get(province.toUpperCase());
    
    if (!acknowledgment || !acknowledgment.acknowledged) {
      return res.status(403).json({
        message: 'Province regulations must be acknowledged before proceeding',
        province: province.toUpperCase(),
        action: 'Please acknowledge province regulations at /api/legal/acknowledge-province'
      });
    }

    next();
  } catch (err) {
    console.error('Error checking province acknowledgment:', err);
    res.status(500).json({ message: 'Error checking compliance', error: err.message });
  }
};

/**
 * Check if terms of service are accepted
 */
const checkTermsAccepted = async (req, res, next) => {
  try {
    const User = require('../models/User.model');
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.termsAccepted || !user.termsAccepted.tos) {
      return res.status(403).json({
        message: 'Terms of Service must be accepted before using this service',
        action: 'Please accept Terms of Service at /api/legal/accept-terms'
      });
    }

    next();
  } catch (err) {
    console.error('Error checking terms acceptance:', err);
    res.status(500).json({ message: 'Error checking compliance', error: err.message });
  }
};

/**
 * Validate provincial compliance requirements
 */
const validateProvincialCompliance = (req, res, next) => {
  const province = req.body.province || req.params.province;
  
  if (!province) {
    return next();
  }

  const regulations = getProvincialRegulations(province.toUpperCase());
  
  if (!regulations) {
    return res.status(400).json({
      message: 'Invalid province code',
      validProvinces: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
    });
  }

  // Attach regulations to request for use in controllers
  req.provincialRegulations = regulations;
  
  next();
};

/**
 * Check disclosure requirements for property listing
 */
const checkDisclosureRequirements = async (req, res, next) => {
  try {
    const province = req.body.province;
    
    if (!province) {
      return next();
    }

    const regulations = getProvincialRegulations(province.toUpperCase());
    
    if (!regulations) {
      return next();
    }

    // Check if required disclosures are present
    const disclosureChecks = req.body.regulatoryCompliance?.complianceChecks || [];
    const requiredDisclosures = regulations.mandatoryDisclosures;
    
    const missingDisclosures = requiredDisclosures.filter(
      disclosure => !disclosureChecks.some(
        check => check.requirement === disclosure && check.completed === true
      )
    );

    if (missingDisclosures.length > 0) {
      return res.status(400).json({
        message: 'Missing required disclosures for this province',
        province: province.toUpperCase(),
        missingDisclosures,
        requiredDisclosures: regulations.mandatoryDisclosures
      });
    }

    next();
  } catch (err) {
    console.error('Error checking disclosure requirements:', err);
    res.status(500).json({ message: 'Error checking compliance', error: err.message });
  }
};

module.exports = {
  checkProvinceAcknowledgment,
  checkTermsAccepted,
  validateProvincialCompliance,
  checkDisclosureRequirements
};

