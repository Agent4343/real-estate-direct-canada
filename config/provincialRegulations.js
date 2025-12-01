/**
 * Provincial Regulations Configuration
 * Defines rules, requirements, and compliance checks for each Canadian province/territory
 */

const CanadianProvinces = {
  BC: {
    name: 'British Columbia',
    code: 'BC',
    regulatoryBody: 'BCFSA',
    regulatoryBodyName: 'BC Financial Services Authority',
    website: 'https://www.bcfsa.ca',
    disclosureRequirements: [
      'Property Disclosure Statement',
      'Strata Documents (if applicable)',
      'Latent Defects Disclosure',
      'Rental Restrictions (if applicable)'
    ],
    coolingOffPeriod: 7, // days
    depositRequirements: {
      min: 0.05, // 5% minimum
      max: 0.10  // 10% maximum
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Strata Bylaws',
      'Rental Restrictions',
      'Building Permits',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Land Title Search',
      'Survey Certificate (if required)',
      'Property Tax Certificate'
    ]
  },
  AB: {
    name: 'Alberta',
    code: 'AB',
    regulatoryBody: 'RECA',
    regulatoryBodyName: 'Real Estate Council of Alberta',
    website: 'https://www.reca.ca',
    disclosureRequirements: [
      'Property Disclosure Statement',
      'Real Property Report',
      'Condominium Documents (if applicable)'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Real Property Report',
      'Property Taxes',
      'Encumbrances'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Land Title Certificate',
      'Real Property Report',
      'Tax Certificate'
    ]
  },
  SK: {
    name: 'Saskatchewan',
    code: 'SK',
    regulatoryBody: 'SCA',
    regulatoryBodyName: 'Saskatchewan Consumer Affairs',
    website: 'https://www.saskatchewan.ca/government/government-structure/ministries/justice',
    disclosureRequirements: [
      'Property Condition Disclosure Statement',
      'Condominium Documents (if applicable)'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Property Taxes',
      'Title Issues'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Tax Certificate'
    ]
  },
  MB: {
    name: 'Manitoba',
    code: 'MB',
    regulatoryBody: 'MREA',
    regulatoryBodyName: 'Manitoba Real Estate Association',
    website: 'https://www.mrea.mb.ca',
    disclosureRequirements: [
      'Property Condition Disclosure Statement',
      'Condominium Documents (if applicable)'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Tax Certificate'
    ]
  },
  ON: {
    name: 'Ontario',
    code: 'ON',
    regulatoryBody: 'RECO',
    regulatoryBodyName: 'Real Estate Council of Ontario',
    website: 'https://www.reco.on.ca',
    disclosureRequirements: [
      'Agreement of Purchase and Sale',
      'Tarion Warranty (if new build)',
      'Condominium Documents (if applicable)',
      'Latent Defects Disclosure'
    ],
    coolingOffPeriod: 10,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Building Permits',
      'Property Taxes',
      'Tarion Warranty (new builds)'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Survey (if required)',
      'Tax Certificate',
      'Tarion Warranty Certificate (if applicable)'
    ]
  },
  QC: {
    name: 'Quebec',
    code: 'QC',
    regulatoryBody: 'OACIQ',
    regulatoryBodyName: 'Organisme d\'autoréglementation du courtage immobilier du Québec',
    website: 'https://www.oaciq.com',
    disclosureRequirements: [
      'Declarations by the Seller',
      'Inspection Reports',
      'Condominium Documents (if applicable)'
    ],
    coolingOffPeriod: 10,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'French Language Requirements',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Land Registry Search',
      'Tax Certificate',
      'French Documentation'
    ]
  },
  NB: {
    name: 'New Brunswick',
    code: 'NB',
    regulatoryBody: 'APNB',
    regulatoryBodyName: 'Association of Professional Land Surveyors of NB',
    website: 'https://www.apnb.ca',
    disclosureRequirements: [
      'Property Condition Disclosure',
      'Condominium Documents (if applicable)'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Tax Certificate'
    ]
  },
  NS: {
    name: 'Nova Scotia',
    code: 'NS',
    regulatoryBody: 'NSUARB',
    regulatoryBodyName: 'Nova Scotia Utility and Review Board',
    website: 'https://nsuarb.novascotia.ca',
    disclosureRequirements: [
      'Property Condition Disclosure Statement',
      'Condominium Documents (if applicable)'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Tax Certificate'
    ]
  },
  PE: {
    name: 'Prince Edward Island',
    code: 'PE',
    regulatoryBody: 'PEI Real Estate Association',
    regulatoryBodyName: 'PEI Real Estate Association',
    website: 'https://www.peirea.com',
    disclosureRequirements: [
      'Property Condition Disclosure',
      'Condominium Documents (if applicable)'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Tax Certificate'
    ]
  },
  NL: {
    name: 'Newfoundland and Labrador',
    code: 'NL',
    regulatoryBody: 'Service NL',
    regulatoryBodyName: 'Service NL',
    website: 'https://www.gov.nl.ca/servicenl',
    disclosureRequirements: [
      'Property Condition Disclosure',
      'Condominium Documents (if applicable)'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Tax Certificate'
    ]
  },
  YT: {
    name: 'Yukon',
    code: 'YT',
    regulatoryBody: 'Yukon Government',
    regulatoryBodyName: 'Yukon Department of Community Services',
    website: 'https://yukon.ca/en',
    disclosureRequirements: [
      'Property Condition Disclosure'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Tax Certificate'
    ]
  },
  NT: {
    name: 'Northwest Territories',
    code: 'NT',
    regulatoryBody: 'NWT Government',
    regulatoryBodyName: 'NWT Department of Municipal and Community Affairs',
    website: 'https://www.maca.gov.nt.ca',
    disclosureRequirements: [
      'Property Condition Disclosure'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Tax Certificate'
    ]
  },
  NU: {
    name: 'Nunavut',
    code: 'NU',
    regulatoryBody: 'Nunavut Government',
    regulatoryBodyName: 'Nunavut Department of Community and Government Services',
    website: 'https://www.gov.nu.ca',
    disclosureRequirements: [
      'Property Condition Disclosure'
    ],
    coolingOffPeriod: 7,
    depositRequirements: {
      min: 0.05,
      max: 0.10
    },
    mandatoryDisclosures: [
      'Latent Defects',
      'Property Taxes'
    ],
    transactionFees: {
      buyer: 0,
      seller: 0
    },
    legalRequirements: [
      'Title Search',
      'Tax Certificate'
    ]
  }
};

/**
 * Get regulations for a specific province
 */
function getProvincialRegulations(provinceCode) {
  return CanadianProvinces[provinceCode.toUpperCase()] || null;
}

/**
 * Get all provinces
 */
function getAllProvinces() {
  return Object.values(CanadianProvinces);
}

/**
 * Get list of province codes
 */
function getProvinceCodes() {
  return Object.keys(CanadianProvinces);
}

/**
 * Validate if province code is valid
 */
function isValidProvince(provinceCode) {
  return CanadianProvinces.hasOwnProperty(provinceCode.toUpperCase());
}

module.exports = {
  CanadianProvinces,
  getProvincialRegulations,
  getAllProvinces,
  getProvinceCodes,
  isValidProvince
};

