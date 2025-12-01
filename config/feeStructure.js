/**
 * Platform Fee Structure Configuration
 * Determines how much the platform charges per transaction
 * 
 * IMPORTANT LEGAL NOTE:
 * - We are a technology platform, NOT a real estate brokerage
 * - Fees must be clearly disclosed as platform/service fees
 * - Cannot structure fees like realtor commissions without proper licensing
 */

/**
 * Recommended Fee Models:
 * 
 * Option 1: Flat Fee Per Sale
 * - Simple, transparent
 * - Example: $999-$2,999 per completed sale
 * 
 * Option 2: Percentage of Sale Price (Lower than Realtor Commission)
 * - Scales with property value
 * - Example: 1-2% of sale price (vs 5-6% for realtors)
 * 
 * Option 3: Tiered Flat Fee
 * - Different rates based on property value
 * - More fair for lower-priced properties
 * 
 * Option 4: Hybrid Model (Recommended)
 * - Listing fee: $99-$299 (paid when listing)
 * - Success fee: 1-1.5% of sale price (paid on completion)
 * 
 * RECOMMENDED: Option 4 (Hybrid Model)
 * - Lower barrier to entry
 * - Only pay success fee if property sells
 * - Competitive vs traditional realtors (5-6% total)
 */

const FeeStructure = {
  // RECOMMENDED: Hybrid Model
  model: 'hybrid', // 'flat', 'percentage', 'tiered', 'hybrid'
  
  // Listing Fee (paid upfront when listing property)
  listingFee: {
    amount: 299, // CAD
    currency: 'CAD',
    refundable: false,
    description: 'One-time listing fee to publish your property'
  },
  
  // Success Fee (paid only when property sells)
  successFee: {
    percentage: 1.5, // 1.5% of final sale price
    minimum: 999, // Minimum $999 even if percentage is less
    maximum: 9999, // Maximum $9,999 cap
    currency: 'CAD',
    description: 'Success fee paid only when property sells successfully',
    payableBy: 'seller' // Who pays: 'seller', 'buyer', 'both'
  },
  
  // Alternative: Flat Fee Model
  flatFee: {
    amount: 1999, // CAD
    currency: 'CAD',
    description: 'Flat fee per completed sale',
    payableBy: 'seller'
  },
  
  // Alternative: Percentage Model
  percentageFee: {
    percentage: 1.5, // 1.5% of sale price
    minimum: 999,
    maximum: 9999,
    currency: 'CAD',
    payableBy: 'seller'
  },
  
  // Alternative: Tiered Flat Fee Model
  tieredFee: {
    tiers: [
      { maxPrice: 300000, fee: 999 },      // Properties under $300k: $999
      { maxPrice: 500000, fee: 1499 },     // Properties $300k-$500k: $1,499
      { maxPrice: 750000, fee: 1999 },     // Properties $500k-$750k: $1,999
      { maxPrice: 1000000, fee: 2499 },    // Properties $750k-$1M: $2,499
      { maxPrice: null, fee: 2999 }        // Properties over $1M: $2,999
    ],
    currency: 'CAD',
    payableBy: 'seller'
  },
  
  // Additional Fees (Optional)
  additionalFees: {
    featuredListing: {
      amount: 99,
      duration: 30, // days
      description: 'Feature your listing for 30 days'
    },
    premiumSupport: {
      amount: 299,
      description: 'Priority customer support'
    },
    expeditedVerification: {
      amount: 49,
      description: 'Faster account verification'
    }
  },
  
  // Fee Calculation Helper
  calculateFee: function(salePrice, model = this.model) {
    let fee = 0;
    
    switch(model) {
      case 'flat':
        fee = this.flatFee.amount;
        break;
        
      case 'percentage':
        fee = salePrice * (this.percentageFee.percentage / 100);
        fee = Math.max(fee, this.percentageFee.minimum);
        fee = Math.min(fee, this.percentageFee.maximum);
        break;
        
      case 'tiered':
        for (let tier of this.tieredFee.tiers) {
          if (tier.maxPrice === null || salePrice <= tier.maxPrice) {
            fee = tier.fee;
            break;
          }
        }
        break;
        
      case 'hybrid':
        // Listing fee already paid, just calculate success fee
        fee = salePrice * (this.successFee.percentage / 100);
        fee = Math.max(fee, this.successFee.minimum);
        fee = Math.min(fee, this.successFee.maximum);
        break;
    }
    
    return {
      totalFee: fee,
      listingFee: model === 'hybrid' ? this.listingFee.amount : 0,
      successFee: model === 'hybrid' ? fee : 0,
      currency: this.listingFee.currency,
      model: model
    };
  },
  
  // Compare to realtor commission
  compareToRealtor: function(salePrice) {
    const realtorCommission = salePrice * 0.05; // 5% average
    const platformFee = this.calculateFee(salePrice, this.model);
    const savings = realtorCommission - platformFee.totalFee - (this.model === 'hybrid' ? this.listingFee.amount : 0);
    
    return {
      realtorCommission: realtorCommission,
      platformFee: platformFee.totalFee + (this.model === 'hybrid' ? this.listingFee.amount : 0),
      savings: savings,
      savingsPercentage: (savings / realtorCommission) * 100
    };
  }
};

/**
 * MARKET ANALYSIS (2024):
 * 
 * Traditional Realtors: 5-6% of sale price
 * - On $500,000 property = $25,000-$30,000
 * 
 * Competitors:
 * - PurpleBricks: Flat fee $999-$1,999
 * - ComFree (now PurpleBricks): Flat fee model
 * - FSBO platforms: $99-$999 listing fees
 * 
 * RECOMMENDED FEE STRUCTURE:
 * 
 * Model: Hybrid (Listing + Success Fee)
 * - Listing Fee: $299 (upfront, non-refundable)
 * - Success Fee: 1.5% of sale price (minimum $999, max $9,999)
 * - Total on $500k property: $299 + $7,500 = $7,799
 * - Savings vs Realtor: ~$22,000 (75% savings)
 * 
 * This is:
 * - Competitive (much cheaper than realtors)
 * - Fair (scales with property value)
 * - Profitable (covers platform costs)
 * - Transparent (users know exact costs upfront)
 */

module.exports = FeeStructure;

