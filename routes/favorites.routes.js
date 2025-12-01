const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite.model');
const Property = require('../models/Property.model');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/favorites
 * @desc    Add property to favorites
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { propertyId, notes, tags } = req.body;
    
    if (!propertyId) {
      return res.status(400).json({ message: 'Property ID is required' });
    }
    
    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check if already favorited
    const existing = await Favorite.findOne({
      userId: req.user.userId,
      propertyId: propertyId
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }
    
    const favorite = new Favorite({
      userId: req.user.userId,
      propertyId: propertyId,
      notes: notes || '',
      tags: tags || []
    });
    
    await favorite.save();
    
    res.status(201).json({
      message: 'Property added to favorites',
      favorite
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Property already in favorites' });
    }
    console.error('Error adding favorite:', err);
    res.status(500).json({ message: 'Error adding favorite', error: err.message });
  }
});

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorites
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const favorites = await Favorite.find({ userId: req.user.userId })
      .populate('propertyId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Favorite.countDocuments({ userId: req.user.userId });
    
    res.json({
      favorites,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalFavorites: total
      }
    });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    res.status(500).json({ message: 'Error fetching favorites', error: err.message });
  }
});

/**
 * @route   GET /api/favorites/:propertyId
 * @desc    Check if property is favorited
 * @access  Private
 */
router.get('/:propertyId', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      userId: req.user.userId,
      propertyId: req.params.propertyId
    });
    
    res.json({
      isFavorited: !!favorite,
      favorite: favorite || null
    });
  } catch (err) {
    console.error('Error checking favorite:', err);
    res.status(500).json({ message: 'Error checking favorite', error: err.message });
  }
});

/**
 * @route   PUT /api/favorites/:id
 * @desc    Update favorite (notes, tags)
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { notes, tags } = req.body;
    
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    if (notes !== undefined) favorite.notes = notes;
    if (tags !== undefined) favorite.tags = tags;
    
    await favorite.save();
    
    res.json({
      message: 'Favorite updated successfully',
      favorite
    });
  } catch (err) {
    console.error('Error updating favorite:', err);
    res.status(400).json({ message: 'Error updating favorite', error: err.message });
  }
});

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Remove property from favorites
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }
    
    await favorite.deleteOne();
    
    res.json({ message: 'Property removed from favorites' });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ message: 'Error removing favorite', error: err.message });
  }
});

/**
 * @route   DELETE /api/favorites/property/:propertyId
 * @desc    Remove property from favorites by property ID
 * @access  Private
 */
router.delete('/property/:propertyId', authenticateToken, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      userId: req.user.userId,
      propertyId: req.params.propertyId
    });
    
    if (!favorite) {
      return res.status(404).json({ message: 'Property not in favorites' });
    }
    
    res.json({ message: 'Property removed from favorites' });
  } catch (err) {
    console.error('Error removing favorite:', err);
    res.status(500).json({ message: 'Error removing favorite', error: err.message });
  }
});

module.exports = router;

