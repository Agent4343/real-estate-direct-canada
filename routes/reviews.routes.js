const express = require('express');
const router = express.Router();
const Review = require('../models/Review.model');
const Property = require('../models/Property.model');
const Transaction = require('../models/Transaction.model');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/reviews
 * @desc    Create a property review
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      propertyId,
      transactionId,
      rating,
      title,
      comment,
      detailedRatings
    } = req.body;
    
    if (!propertyId || !rating || !comment) {
      return res.status(400).json({ 
        message: 'Property ID, rating, and comment are required' 
      });
    }
    
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      propertyId,
      reviewerId: req.user.userId
    });
    
    if (existingReview) {
      return res.status(400).json({ 
        message: 'You have already reviewed this property',
        existingReview 
      });
    }
    
    // If transaction ID provided, verify user completed transaction
    if (transactionId) {
      const transaction = await Transaction.findOne({
        _id: transactionId,
        propertyId,
        $or: [
          { buyerId: req.user.userId },
          { sellerId: req.user.userId }
        ],
        status: 'Completed'
      });
      
      if (!transaction) {
        return res.status(400).json({ 
          message: 'Transaction not found or not completed' 
        });
      }
    }
    
    const review = new Review({
      propertyId,
      transactionId,
      reviewerId: req.user.userId,
      rating,
      title: title || '',
      comment,
      detailedRatings,
      status: 'Pending' // Requires moderation
    });
    
    await review.save();
    
    // Recalculate property rating
    await updatePropertyRating(propertyId);
    
    res.status(201).json({
      message: 'Review submitted successfully (pending moderation)',
      review
    });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(400).json({ message: 'Error creating review', error: err.message });
  }
});

/**
 * @route   GET /api/reviews/property/:propertyId
 * @desc    Get reviews for a property
 * @access  Public
 */
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', rating } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {
      propertyId: req.params.propertyId,
      status: 'Approved'
    };
    
    if (rating) {
      query.rating = Number(rating);
    }
    
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const reviews = await Review.find(query)
      .populate('reviewerId', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Review.countDocuments(query);
    
    // Get rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { propertyId: req.params.propertyId, status: 'Approved' } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      reviews,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalReviews: total
      },
      ratingStats
    });
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Error fetching reviews', error: err.message });
  }
});

/**
 * @route   GET /api/reviews/:id
 * @desc    Get a specific review
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewerId', 'name email')
      .populate('propertyId', 'title address');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json({ review });
  } catch (err) {
    console.error('Error fetching review:', err);
    res.status(500).json({ message: 'Error fetching review', error: err.message });
  }
});

/**
 * @route   PUT /api/reviews/:id/helpful
 * @desc    Mark review as helpful
 * @access  Private
 */
router.put('/:id/helpful', authenticateToken, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if already marked as helpful
    if (review.helpfulUsers.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You have already marked this review as helpful' });
    }
    
    review.helpfulUsers.push(req.user.userId);
    review.helpfulCount += 1;
    await review.save();
    
    res.json({
      message: 'Review marked as helpful',
      helpfulCount: review.helpfulCount
    });
  } catch (err) {
    console.error('Error marking review as helpful:', err);
    res.status(500).json({ message: 'Error updating review', error: err.message });
  }
});

/**
 * @route   PUT /api/reviews/:id/response
 * @desc    Add owner response to review
 * @access  Private
 */
router.put('/:id/response', authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Response message is required' });
    }
    
    const review = await Review.findById(req.params.id)
      .populate('propertyId');
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Verify user is property owner
    if (review.propertyId.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only property owner can respond' });
    }
    
    review.ownerResponse = {
      message,
      respondedAt: new Date(),
      respondedBy: req.user.userId
    };
    
    await review.save();
    
    res.json({
      message: 'Response added successfully',
      review
    });
  } catch (err) {
    console.error('Error adding response:', err);
    res.status(500).json({ message: 'Error adding response', error: err.message });
  }
});

/**
 * Update property rating statistics
 */
async function updatePropertyRating(propertyId) {
  try {
    const stats = await Review.aggregate([
      { $match: { propertyId, status: 'Approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);
    
    if (stats.length > 0) {
      const property = await Property.findById(propertyId);
      if (property) {
        property.rating = {
          average: parseFloat(stats[0].averageRating.toFixed(2)),
          total: stats[0].totalReviews,
          distribution: {
            5: stats[0].ratingDistribution.filter(r => r === 5).length,
            4: stats[0].ratingDistribution.filter(r => r === 4).length,
            3: stats[0].ratingDistribution.filter(r => r === 3).length,
            2: stats[0].ratingDistribution.filter(r => r === 2).length,
            1: stats[0].ratingDistribution.filter(r => r === 1).length
          }
        };
        await property.save();
      }
    }
  } catch (err) {
    console.error('Error updating property rating:', err);
  }
}

module.exports = router;

