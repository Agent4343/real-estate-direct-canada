const express = require('express');
const router = express.Router();
const SavedSearch = require('../models/SavedSearch.model');
const Property = require('../models/Property.model');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/saved-searches
 * @desc    Create a new saved search
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      searchCriteria,
      emailNotifications = true,
      notificationFrequency = 'Daily'
    } = req.body;
    
    if (!name || !searchCriteria) {
      return res.status(400).json({ 
        message: 'Name and search criteria are required' 
      });
    }
    
    const savedSearch = new SavedSearch({
      userId: req.user.userId,
      name,
      searchCriteria,
      emailNotifications,
      notificationFrequency
    });
    
    await savedSearch.save();
    
    res.status(201).json({
      message: 'Saved search created successfully',
      savedSearch
    });
  } catch (err) {
    console.error('Error creating saved search:', err);
    res.status(400).json({ message: 'Error creating saved search', error: err.message });
  }
});

/**
 * @route   GET /api/saved-searches
 * @desc    Get user's saved searches
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const savedSearches = await SavedSearch.find({
      userId: req.user.userId,
      isActive: true
    }).sort({ createdAt: -1 });
    
    res.json({
      savedSearches,
      count: savedSearches.length
    });
  } catch (err) {
    console.error('Error fetching saved searches:', err);
    res.status(500).json({ message: 'Error fetching saved searches', error: err.message });
  }
});

/**
 * @route   GET /api/saved-searches/:id
 * @desc    Get saved search details
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const savedSearch = await SavedSearch.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!savedSearch) {
      return res.status(404).json({ message: 'Saved search not found' });
    }
    
    // Get current matches
    const query = buildSearchQuery(savedSearch.searchCriteria);
    const matches = await Property.find(query).limit(10);
    
    res.json({
      savedSearch,
      currentMatches: {
        count: await Property.countDocuments(query),
        properties: matches
      }
    });
  } catch (err) {
    console.error('Error fetching saved search:', err);
    res.status(500).json({ message: 'Error fetching saved search', error: err.message });
  }
});

/**
 * @route   GET /api/saved-searches/:id/matches
 * @desc    Get properties matching saved search
 * @access  Private
 */
router.get('/:id/matches', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    const savedSearch = await SavedSearch.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!savedSearch) {
      return res.status(404).json({ message: 'Saved search not found' });
    }
    
    const query = buildSearchQuery(savedSearch.searchCriteria);
    
    const properties = await Property.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('sellerId', 'name email');
    
    const total = await Property.countDocuments(query);
    
    // Update match count
    savedSearch.matchCount = total;
    savedSearch.lastMatchDate = new Date();
    await savedSearch.save();
    
    res.json({
      properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalMatches: total
      }
    });
  } catch (err) {
    console.error('Error fetching matches:', err);
    res.status(500).json({ message: 'Error fetching matches', error: err.message });
  }
});

/**
 * @route   PUT /api/saved-searches/:id
 * @desc    Update saved search
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const savedSearch = await SavedSearch.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!savedSearch) {
      return res.status(404).json({ message: 'Saved search not found' });
    }
    
    Object.assign(savedSearch, req.body);
    savedSearch.updatedAt = new Date();
    await savedSearch.save();
    
    res.json({
      message: 'Saved search updated successfully',
      savedSearch
    });
  } catch (err) {
    console.error('Error updating saved search:', err);
    res.status(400).json({ message: 'Error updating saved search', error: err.message });
  }
});

/**
 * @route   DELETE /api/saved-searches/:id
 * @desc    Delete saved search
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const savedSearch = await SavedSearch.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!savedSearch) {
      return res.status(404).json({ message: 'Saved search not found' });
    }
    
    savedSearch.isActive = false;
    await savedSearch.save();
    
    res.json({ message: 'Saved search deleted successfully' });
  } catch (err) {
    console.error('Error deleting saved search:', err);
    res.status(500).json({ message: 'Error deleting saved search', error: err.message });
  }
});

/**
 * Build MongoDB query from search criteria
 */
function buildSearchQuery(criteria) {
  const query = { status: 'Active' };
  
  if (criteria.province) query.province = criteria.province;
  if (criteria.city) query.city = new RegExp(criteria.city, 'i');
  if (criteria.propertyType) query.propertyType = criteria.propertyType;
  if (criteria.listingType) query.listingType = criteria.listingType;
  
  if (criteria.minPrice || criteria.maxPrice) {
    query.price = {};
    if (criteria.minPrice) query.price.$gte = Number(criteria.minPrice);
    if (criteria.maxPrice) query.price.$lte = Number(criteria.maxPrice);
  }
  
  if (criteria.bedrooms) query.bedrooms = { $gte: Number(criteria.bedrooms) };
  if (criteria.bathrooms) query.bathrooms = { $gte: Number(criteria.bathrooms) };
  
  if (criteria.minSquareFeet || criteria.maxSquareFeet) {
    query.squareFeet = {};
    if (criteria.minSquareFeet) query.squareFeet.$gte = Number(criteria.minSquareFeet);
    if (criteria.maxSquareFeet) query.squareFeet.$lte = Number(criteria.maxSquareFeet);
  }
  
  if (criteria.keywords) {
    query.$or = [
      { title: new RegExp(criteria.keywords, 'i') },
      { description: new RegExp(criteria.keywords, 'i') }
    ];
  }
  
  return query;
}

module.exports = router;

