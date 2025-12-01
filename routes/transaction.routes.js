const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction.model');
const Property = require('../models/Property.model');
const { authenticateToken } = require('../middleware/auth');
const { checkProvinceAcknowledgment, validateProvincialCompliance } = require('../middleware/compliance');
const { logTransactionEvent } = require('../middleware/auditLogger');
const feeStructure = require('../config/feeStructure');
const { notifyNewOffer, notifyOfferAccepted, notifyOfferRejected } = require('../utils/notificationService');

/**
 * @route   POST /api/transactions/offer
 * @desc    Make an offer on a property
 * @access  Private
 */
router.post('/offer', authenticateToken, validateProvincialCompliance, checkProvinceAcknowledgment, async (req, res) => {
  try {
    const {
      propertyId,
      offerPrice,
      conditions,
      closingDate,
      depositAmount
    } = req.body;

    // Find property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    if (property.status !== 'Active') {
      return res.status(400).json({ 
        message: 'Property is not available for offers',
        status: property.status
      });
    }

    // Check if user is trying to buy their own property
    if (property.sellerId.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Cannot make an offer on your own property' });
    }

    // Get provincial regulations for cooling-off period
    const regulations = req.provincialRegulations || {};
    const coolingOffPeriod = regulations.coolingOffPeriod || 7;
    const coolingOffPeriodEnd = new Date();
    coolingOffPeriodEnd.setDate(coolingOffPeriodEnd.getDate() + coolingOffPeriod);

    // Calculate deposit if not provided
    const deposit = depositAmount || (offerPrice * (regulations.depositRequirements?.min || 0.05));

    // Create transaction/offer
    const transaction = new Transaction({
      buyerId: req.user.userId,
      sellerId: property.sellerId,
      propertyId: propertyId,
      transactionType: property.listingType === 'Sale' ? 'Sale' : 'Rent',
      status: 'Offer Made',
      offerPrice: offerPrice,
      depositAmount: deposit,
      offerDate: new Date(),
      closingDate: closingDate || null,
      coolingOffPeriodEnd: coolingOffPeriodEnd,
      conditions: conditions || [],
      province: property.province,
      complianceStatus: 'Not Started'
    });

    const savedTransaction = await transaction.save();

    // Calculate platform fees
    const feeCalculation = feeStructure.calculateFee(offerPrice, 'hybrid');
    savedTransaction.platformFees = {
      listingFee: {
        amount: feeCalculation.listingFee,
        paid: false
      },
      successFee: {
        amount: feeCalculation.successFee,
        percentage: feeStructure.successFee.percentage,
        calculated: true,
        paid: false
      },
      totalFee: feeCalculation.totalFee,
      feeModel: 'hybrid',
      payableBy: 'seller'
    };
    await savedTransaction.save();

    // Update property interest count
    property.interestCount += 1;
    await property.save();

    // Log audit event
    await logTransactionEvent(req, 'OFFER_MADE', savedTransaction._id, 
      `Offer made on property: ${property.title}`, {
      offerPrice,
      depositAmount: deposit,
      coolingOffPeriod
    });

    // Notify seller about new offer
    await notifyNewOffer(property.sellerId, savedTransaction._id, offerPrice);

    res.status(201).json({
      message: 'Offer submitted successfully',
      transaction: savedTransaction,
      coolingOffPeriod: coolingOffPeriod,
      coolingOffPeriodEnd: coolingOffPeriodEnd,
      platformFees: savedTransaction.platformFees
    });
  } catch (err) {
    console.error('Error creating offer:', err);
    res.status(500).json({ message: 'Error creating offer', error: err.message });
  }
});

/**
 * @route   GET /api/transactions/my-offers
 * @desc    Get user's offers (buyer)
 * @access  Private
 */
router.get('/my-offers', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ buyerId: req.user.userId })
      .populate('propertyId', 'title price address province city images')
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      offers: transactions,
      count: transactions.length
    });
  } catch (err) {
    console.error('Error fetching offers:', err);
    res.status(500).json({ message: 'Error fetching offers', error: err.message });
  }
});

/**
 * @route   GET /api/transactions/my-listings
 * @desc    Get offers on user's listings (seller)
 * @access  Private
 */
router.get('/my-listings', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ sellerId: req.user.userId })
      .populate('propertyId', 'title price address province city images')
      .populate('buyerId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      offers: transactions,
      count: transactions.length
    });
  } catch (err) {
    console.error('Error fetching listing offers:', err);
    res.status(500).json({ message: 'Error fetching listing offers', error: err.message });
  }
});

/**
 * @route   GET /api/transactions/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('buyerId', 'name email phone')
      .populate('sellerId', 'name email phone')
      .populate('propertyId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is part of this transaction
    if (transaction.buyerId._id.toString() !== req.user.userId && 
        transaction.sellerId._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to view this transaction' });
    }

    res.json(transaction);
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ message: 'Error fetching transaction', error: err.message });
  }
});

/**
 * @route   PUT /api/transactions/:id/accept
 * @desc    Accept an offer
 * @access  Private (Seller)
 */
router.put('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('propertyId');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the seller
    if (transaction.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the seller can accept offers' });
    }

    // Update transaction status
    transaction.status = 'Offer Accepted';
    transaction.acceptanceDate = new Date();
    transaction.statusHistory.push({
      status: 'Offer Accepted',
      changedAt: new Date(),
      reason: 'Seller accepted the offer'
    });

    // Update property status
    const property = transaction.propertyId;
    property.status = 'Pending';
    await property.save();

    await transaction.save();

    // Log audit event
    await logTransactionEvent(req, 'OFFER_ACCEPTED', transaction._id,
      `Offer accepted for property transaction`, {
      offerPrice: transaction.offerPrice
    });

    // Notify buyer about accepted offer
    await notifyOfferAccepted(transaction.buyerId, transaction._id);

    res.json({
      message: 'Offer accepted successfully',
      transaction
    });
  } catch (err) {
    console.error('Error accepting offer:', err);
    res.status(500).json({ message: 'Error accepting offer', error: err.message });
  }
});

/**
 * @route   PUT /api/transactions/:id/reject
 * @desc    Reject an offer
 * @access  Private (Seller)
 */
router.put('/:id/reject', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the seller
    if (transaction.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the seller can reject offers' });
    }

    transaction.status = 'Offer Rejected';
    transaction.statusHistory.push({
      status: 'Offer Rejected',
      changedAt: new Date(),
      reason: req.body.reason || 'Offer rejected by seller'
    });

    await transaction.save();

    // Log audit event
    await logTransactionEvent(req, 'OFFER_REJECTED', transaction._id,
      'Offer rejected by seller', {
      offerPrice: transaction.offerPrice,
      reason: req.body.reason
    });

    // Notify buyer about rejected offer
    await notifyOfferRejected(transaction.buyerId, transaction._id);

    res.json({
      message: 'Offer rejected',
      transaction
    });
  } catch (err) {
    console.error('Error rejecting offer:', err);
    res.status(500).json({ message: 'Error rejecting offer', error: err.message });
  }
});

/**
 * @route   PUT /api/transactions/:id/withdraw
 * @desc    Withdraw an offer
 * @access  Private (Buyer)
 */
router.put('/:id/withdraw', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Check if user is the buyer
    if (transaction.buyerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the buyer can withdraw offers' });
    }

    if (transaction.status !== 'Offer Made') {
      return res.status(400).json({ 
        message: 'Can only withdraw pending offers',
        currentStatus: transaction.status
      });
    }

    transaction.status = 'Cancelled';
    transaction.cancellationReason = req.body.reason || 'Withdrawn by buyer';
    transaction.cancellationDate = new Date();
    transaction.statusHistory.push({
      status: 'Cancelled',
      changedAt: new Date(),
      reason: transaction.cancellationReason
    });

    await transaction.save();

    res.json({
      message: 'Offer withdrawn successfully',
      transaction
    });
  } catch (err) {
    console.error('Error withdrawing offer:', err);
    res.status(500).json({ message: 'Error withdrawing offer', error: err.message });
  }
});

module.exports = router;

