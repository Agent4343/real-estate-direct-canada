const express = require('express');
const router = express.Router();
const Property = require('../models/Property.model');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/comparison/compare
 * @desc    Compare multiple properties
 * @access  Public
 */
router.post('/compare', async (req, res) => {
  try {
    const { propertyIds } = req.body;
    
    if (!propertyIds || !Array.isArray(propertyIds) || propertyIds.length < 2) {
      return res.status(400).json({ 
        message: 'Please provide at least 2 property IDs to compare' 
      });
    }
    
    if (propertyIds.length > 5) {
      return res.status(400).json({ 
        message: 'Cannot compare more than 5 properties at once' 
      });
    }
    
    // Fetch all properties
    const properties = await Property.find({
      _id: { $in: propertyIds },
      status: 'Active'
    }).populate('sellerId', 'name email');
    
    if (properties.length !== propertyIds.length) {
      return res.status(404).json({ 
        message: 'One or more properties not found or inactive' 
      });
    }
    
    // Create comparison data
    const comparison = {
      properties: properties.map(prop => ({
        id: prop._id,
        title: prop.title,
        address: prop.address,
        city: prop.city,
        province: prop.province,
        price: prop.price,
        propertyType: prop.propertyType,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        squareFootage: prop.squareFootage,
        lotSize: prop.lotSize,
        yearBuilt: prop.yearBuilt,
        images: prop.images?.[0]?.url || null,
        rating: prop.rating,
        features: prop.features || [],
        amenities: prop.amenities || []
      })),
      summary: {
        priceRange: {
          min: Math.min(...properties.map(p => p.price)),
          max: Math.max(...properties.map(p => p.price)),
          average: properties.reduce((sum, p) => sum + p.price, 0) / properties.length
        },
        bedroomsRange: {
          min: Math.min(...properties.map(p => p.bedrooms || 0)),
          max: Math.max(...properties.map(p => p.bedrooms || 0))
        },
        bathroomsRange: {
          min: Math.min(...properties.map(p => p.bathrooms || 0)),
          max: Math.max(...properties.map(p => p.bathrooms || 0))
        },
        squareFootageRange: {
          min: Math.min(...properties.map(p => p.squareFootage || 0)),
          max: Math.max(...properties.map(p => p.squareFootage || 0)),
          average: properties.reduce((sum, p) => sum + (p.squareFootage || 0), 0) / properties.length
        }
      }
    };
    
    res.json({
      comparison,
      count: properties.length
    });
  } catch (err) {
    console.error('Error comparing properties:', err);
    res.status(500).json({ message: 'Error comparing properties', error: err.message });
  }
});

/**
 * @route   GET /api/comparison/saved
 * @desc    Get saved comparison (if user has favorites)
 * @access  Private
 */
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const Favorite = require('../models/Favorite.model');
    
    const favorites = await Favorite.find({ userId: req.user.userId })
      .populate('propertyId')
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (favorites.length < 2) {
      return res.json({
        message: 'Add at least 2 properties to favorites to compare',
        favorites: favorites.map(f => ({
          id: f.propertyId._id,
          title: f.propertyId.title
        }))
      });
    }
    
    const propertyIds = favorites.map(f => f.propertyId._id);
    
    // Use comparison logic
    const comparison = await Property.find({
      _id: { $in: propertyIds },
      status: 'Active'
    }).populate('sellerId', 'name email');
    
    res.json({
      message: 'Comparison from favorites',
      comparison: {
        properties: comparison.map(prop => ({
          id: prop._id,
          title: prop.title,
          address: prop.address,
          price: prop.price,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          squareFootage: prop.squareFootage,
          images: prop.images?.[0]?.url || null
        }))
      }
    });
  } catch (err) {
    console.error('Error fetching saved comparison:', err);
    res.status(500).json({ message: 'Error fetching saved comparison', error: err.message });
  }
});

module.exports = router;

