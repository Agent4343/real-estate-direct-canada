const express = require('express');
const router = express.Router();
const Lawyer = require('../models/Lawyer.model');
const { isValidProvince } = require('../config/provincialRegulations');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/lawyers
 * @desc    Get all lawyers with filtering
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      province,
      city,
      specialty,
      service,
      minRating,
      verified,
      page = 1,
      limit = 20,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    const query = { status: 'Active' };

    if (province) {
      if (!isValidProvince(province)) {
        return res.status(400).json({ 
          message: 'Invalid province code'
        });
      }
      query.province = province.toUpperCase();
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (specialty) {
      query.specialties = specialty;
    }

    if (service) {
      query.services = service;
    }

    if (minRating) {
      query['rating.average'] = { $gte: Number(minRating) };
    }

    if (verified !== undefined) {
      query.verified = verified === 'true';
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const lawyers = await Lawyer.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Lawyer.countDocuments(query);

    res.json({
      lawyers,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalLawyers: total
      }
    });
  } catch (err) {
    console.error('Error fetching lawyers:', err);
    res.status(500).json({ message: 'Error fetching lawyers', error: err.message });
  }
});

/**
 * @route   GET /api/lawyers/nearby
 * @desc    Find lawyers near a location
 * @access  Public
 */
router.get('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 50000 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required'
      });
    }

    const lawyers = await Lawyer.findNearest(
      Number(latitude),
      Number(longitude),
      Number(maxDistance)
    );

    res.json({
      location: { latitude, longitude },
      maxDistance,
      lawyers,
      count: lawyers.length
    });
  } catch (err) {
    console.error('Error finding nearby lawyers:', err);
    res.status(500).json({ message: 'Error finding nearby lawyers', error: err.message });
  }
});

/**
 * @route   GET /api/lawyers/province/:province
 * @desc    Get lawyers by province
 * @access  Public
 */
router.get('/province/:province', async (req, res) => {
  try {
    const province = req.params.province.toUpperCase();
    const { city } = req.query;
    
    if (!isValidProvince(province)) {
      return res.status(400).json({ 
        message: 'Invalid province code'
      });
    }

    const lawyers = await Lawyer.findByLocation(province, city, { limit: 50 });

    res.json({
      province,
      city: city || 'All',
      lawyers,
      count: lawyers.length
    });
  } catch (err) {
    console.error('Error fetching lawyers by province:', err);
    res.status(500).json({ message: 'Error fetching lawyers', error: err.message });
  }
});

/**
 * @route   GET /api/lawyers/:id
 * @desc    Get single lawyer by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    // Increment click count
    lawyer.clicks += 1;
    await lawyer.save();

    res.json(lawyer);
  } catch (err) {
    console.error('Error fetching lawyer:', err);
    res.status(500).json({ message: 'Error fetching lawyer', error: err.message });
  }
});

/**
 * @route   POST /api/lawyers/:id/inquire
 * @desc    Send inquiry to lawyer
 * @access  Private
 */
router.post('/:id/inquire', authenticateToken, async (req, res) => {
  try {
    const lawyer = await Lawyer.findById(req.params.id);

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    // Increment inquiry count
    lawyer.inquiries += 1;
    await lawyer.save();

    // TODO: Send email notification to lawyer
    // TODO: Create inquiry record

    res.json({
      message: 'Inquiry sent successfully',
      lawyer: {
        id: lawyer._id,
        name: lawyer.fullName,
        email: lawyer.email,
        phone: lawyer.phone,
        firmName: lawyer.firmName
      }
    });
  } catch (err) {
    console.error('Error sending inquiry:', err);
    res.status(500).json({ message: 'Error sending inquiry', error: err.message });
  }
});

/**
 * @route   POST /api/lawyers/:id/review
 * @desc    Add review to lawyer
 * @access  Private
 */
router.post('/:id/review', authenticateToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const lawyer = await Lawyer.findById(req.params.id);

    if (!lawyer) {
      return res.status(404).json({ message: 'Lawyer not found' });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Add review
    lawyer.reviews.push({
      userId: req.user.userId,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date()
    });

    // Update average rating
    const totalRating = lawyer.reviews.reduce((sum, review) => sum + review.rating, 0);
    lawyer.rating.average = (totalRating / lawyer.reviews.length).toFixed(2);
    lawyer.rating.count = lawyer.reviews.length;

    await lawyer.save();

    res.json({
      message: 'Review added successfully',
      review: lawyer.reviews[lawyer.reviews.length - 1]
    });
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).json({ message: 'Error adding review', error: err.message });
  }
});

/**
 * @route   POST /api/lawyers
 * @desc    Create new lawyer listing (Admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin check middleware
    
    const lawyer = new Lawyer(req.body);
    const savedLawyer = await lawyer.save();

    res.status(201).json({
      message: 'Lawyer listing created successfully',
      lawyer: savedLawyer
    });
  } catch (err) {
    console.error('Error creating lawyer:', err);
    res.status(400).json({ message: 'Error creating lawyer', error: err.message });
  }
});

module.exports = router;

