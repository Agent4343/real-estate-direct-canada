const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction.model');
const Property = require('../models/Property.model');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/messaging/send
 * @desc    Send message between buyer and seller
 * @access  Private
 */
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const {
      transactionId,
      propertyId,
      recipientId,
      message
    } = req.body;
    
    if (!message || (!transactionId && !propertyId && !recipientId)) {
      return res.status(400).json({ 
        message: 'Message and transaction/property/recipient ID required' 
      });
    }
    
    // Determine context
    if (transactionId) {
      // Message in transaction context
      const transaction = await Transaction.findById(transactionId);
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      // Verify user is part of transaction
      if (transaction.buyerId.toString() !== req.user.userId && 
          transaction.sellerId.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Determine recipient
      const recipientId = transaction.buyerId.toString() === req.user.userId 
        ? transaction.sellerId 
        : transaction.buyerId;
      
      // Add message to transaction
      transaction.messages.push({
        from: req.user.userId,
        message: message,
        timestamp: new Date()
      });
      
      await transaction.save();
      
      // TODO: Send email notification to recipient
      
      res.json({
        message: 'Message sent successfully',
        messageId: transaction.messages[transaction.messages.length - 1]._id
      });
    } else if (propertyId) {
      // Message about property (before transaction)
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      
      // Check if user is seller
      if (property.sellerId.toString() === req.user.userId) {
        return res.status(400).json({ message: 'Cannot send message to yourself' });
      }
      
      // Create transaction for messaging (or use existing)
      let transaction = await Transaction.findOne({
        propertyId: propertyId,
        buyerId: req.user.userId,
        sellerId: property.sellerId
      });
      
      if (!transaction) {
        // Create transaction for communication
        transaction = new Transaction({
          buyerId: req.user.userId,
          sellerId: property.sellerId,
          propertyId: propertyId,
          transactionType: 'Sale',
          status: 'Offer Made',
          offerPrice: 0, // Placeholder
          province: property.province
        });
      }
      
      transaction.messages.push({
        from: req.user.userId,
        message: message,
        timestamp: new Date()
      });
      
      await transaction.save();
      
      // TODO: Send email notification to property owner
      
      res.json({
        message: 'Message sent successfully',
        transactionId: transaction._id
      });
    }
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Error sending message', error: err.message });
  }
});

/**
 * @route   GET /api/messaging/transaction/:transactionId
 * @desc    Get all messages for a transaction
 * @access  Private
 */
router.get('/transaction/:transactionId', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.transactionId)
      .populate('messages.from', 'name email');
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Verify user is part of transaction
    if (transaction.buyerId.toString() !== req.user.userId && 
        transaction.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    res.json({
      transactionId: transaction._id,
      messages: transaction.messages,
      count: transaction.messages.length
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
});

/**
 * @route   GET /api/messaging/property/:propertyId
 * @desc    Get messages for a property
 * @access  Private
 */
router.get('/property/:propertyId', authenticateToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Find transaction(s) for this property
    const transactions = await Transaction.find({
      propertyId: req.params.propertyId,
      $or: [
        { buyerId: req.user.userId },
        { sellerId: req.user.userId }
      ]
    }).populate('messages.from', 'name email');
    
    const allMessages = [];
    transactions.forEach(transaction => {
      transaction.messages.forEach(msg => {
        allMessages.push({
          ...msg.toObject(),
          transactionId: transaction._id
        });
      });
    });
    
    // Sort by timestamp
    allMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    res.json({
      propertyId: req.params.propertyId,
      messages: allMessages,
      count: allMessages.length
    });
  } catch (err) {
    console.error('Error fetching property messages:', err);
    res.status(500).json({ message: 'Error fetching messages', error: err.message });
  }
});

module.exports = router;

