const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction.model');
const Property = require('../models/Property.model');
const { authenticateToken } = require('../middleware/auth');
const { calculateFee } = require('../config/feeStructure');

/**
 * @route   POST /api/payments/listing-fee
 * @desc    Process listing fee payment
 * @access  Private
 */
router.post('/listing-fee', authenticateToken, async (req, res) => {
  try {
    const { propertyId, paymentMethod } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }
    
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Verify ownership
    if (property.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Check if already paid
    if (property.platformFees?.listingFee?.paid) {
      return res.status(400).json({ message: 'Listing fee already paid' });
    }
    
    // Calculate listing fee
    const feeStructure = require('../config/feeStructure');
    const listingFee = feeStructure.listingFee.amount;
    
    // TODO: Integrate with Stripe payment processing
    // For now, simulate payment
    
    // Update property with payment info
    if (!property.platformFees) {
      property.platformFees = {};
    }
    property.platformFees.listingFee = {
      amount: listingFee,
      paid: true,
      paidDate: new Date(),
      transactionId: `payment_${Date.now()}`, // Placeholder
      paymentMethod: paymentMethod || 'credit_card'
    };
    
    await property.save();
    
    res.json({
      message: 'Listing fee paid successfully',
      fee: listingFee,
      propertyId: property._id
    });
  } catch (err) {
    console.error('Error processing listing fee:', err);
    res.status(500).json({ message: 'Error processing payment', error: err.message });
  }
});

/**
 * @route   POST /api/payments/success-fee
 * @desc    Process success fee payment (after transaction completes)
 * @access  Private
 */
router.post('/success-fee', authenticateToken, async (req, res) => {
  try {
    const { transactionId, paymentMethod } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' });
    }
    
    const transaction = await Transaction.findById(transactionId)
      .populate('propertyId');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Verify transaction is completed
    if (transaction.status !== 'Completed') {
      return res.status(400).json({ 
        message: 'Success fee can only be paid for completed transactions',
        currentStatus: transaction.status
      });
    }
    
    // Verify user is seller
    if (transaction.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only seller can pay success fee' });
    }
    
    // Check if already paid
    if (transaction.platformFees?.successFee?.paid) {
      return res.status(400).json({ message: 'Success fee already paid' });
    }
    
    // Calculate success fee
    const feeStructure = require('../config/feeStructure');
    const finalPrice = transaction.finalPrice || transaction.offerPrice;
    const feeCalculation = feeStructure.calculateFee(finalPrice, 'hybrid');
    const successFee = feeCalculation.successFee;
    
    // TODO: Integrate with Stripe payment processing
    
    // Update transaction with payment info
    if (!transaction.platformFees) {
      transaction.platformFees = {
        listingFee: { amount: 0, paid: false },
        successFee: { amount: 0, paid: false },
        totalFee: 0
      };
    }
    
    transaction.platformFees.successFee = {
      amount: successFee,
      percentage: feeStructure.successFee.percentage,
      calculated: true,
      paid: true,
      paidDate: new Date(),
      transactionId: `payment_${Date.now()}`,
      paymentMethod: paymentMethod || 'credit_card'
    };
    
    transaction.platformFees.totalFee = feeCalculation.listingFee + successFee;
    
    await transaction.save();
    
    res.json({
      message: 'Success fee paid successfully',
      fee: {
        successFee: successFee,
        totalFee: transaction.platformFees.totalFee
      },
      transactionId: transaction._id
    });
  } catch (err) {
    console.error('Error processing success fee:', err);
    res.status(500).json({ message: 'Error processing payment', error: err.message });
  }
});

/**
 * @route   GET /api/payments/calculate-fee
 * @desc    Calculate platform fees for a property price
 * @access  Public
 */
router.get('/calculate-fee', (req, res) => {
  try {
    const { salePrice, feeModel = 'hybrid' } = req.query;
    
    if (!salePrice) {
      return res.status(400).json({ message: 'Sale price is required' });
    }
    
    const feeStructure = require('../config/feeStructure');
    const feeCalculation = feeStructure.calculateFee(Number(salePrice), feeModel);
    const comparison = feeStructure.compareToRealtor(Number(salePrice));
    
    res.json({
      salePrice: Number(salePrice),
      feeCalculation,
      comparison,
      savings: {
        amount: comparison.savings,
        percentage: comparison.savingsPercentage.toFixed(2) + '%'
      }
    });
  } catch (err) {
    console.error('Error calculating fee:', err);
    res.status(500).json({ message: 'Error calculating fee', error: err.message });
  }
});

module.exports = router;

