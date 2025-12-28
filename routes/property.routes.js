const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Property = require('../models/Property.model');
const { isValidProvince } = require('../config/provincialRegulations');
const { authenticateToken } = require('../middleware/auth');
const { validateProperty } = require('../middleware/validation');

// Configure multer for property image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/properties/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'property-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and WEBP images are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * @route   GET /api/properties
 * @desc    Get all properties with filtering
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      province,
      city,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (province) {
      if (!isValidProvince(province)) {
        return res.status(400).json({ 
          message: 'Invalid province code',
          validProvinces: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
        });
      }
      query.province = province.toUpperCase();
    }
    
    if (city) {
      query.city = new RegExp(city, 'i');
    }
    
    if (propertyType) {
      query.propertyType = propertyType;
    }
    
    if (listingType) {
      query.listingType = listingType;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }
    
    if (bathrooms) {
      query.bathrooms = { $gte: Number(bathrooms) };
    }
    
    if (status) {
      query.status = status;
    } else {
      query.status = 'Active';
    }

    // Calculate pagination
    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Execute query
    const properties = await Property.find(query)
      .populate('sellerId', 'name email phone')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProperties: total,
        hasNext: skip + properties.length < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ message: 'Error fetching properties', error: err.message });
  }
});

/**
 * @route   GET /api/properties/mine
 * @desc    Get properties created by the authenticated user
 * @access  Private
 */
router.get('/mine', authenticateToken, async (req, res) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {
      sellerId: req.user.userId
    };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query)
    ]);

    res.json({
      properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProperties: total,
        hasNext: skip + properties.length < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching user properties:', err);
    res.status(500).json({ message: 'Error fetching properties', error: err.message });
  }
});

/**
 * @route   GET /api/properties/:id
 * @desc    Get single property by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('sellerId', 'name email phone city province');

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Increment view count
    property.viewCount += 1;
    await property.save();

    res.json(property);
  } catch (err) {
    console.error('Error fetching property:', err);
    res.status(500).json({ message: 'Error fetching property', error: err.message });
  }
});

/**
 * @route   POST /api/properties
 * @desc    Create new property listing
 * @access  Private (Seller)
 */
router.post('/', authenticateToken, validateProperty, async (req, res) => {
  try {
    const propertyData = {
      ...req.body,
      sellerId: req.user.userId,
      createdBy: req.user.userId
    };

    // Validate province
    if (propertyData.province && !isValidProvince(propertyData.province)) {
      return res.status(400).json({ 
        message: 'Invalid province code',
        validProvinces: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
      });
    }

    const property = new Property(propertyData);
    const savedProperty = await property.save();

    res.status(201).json({
      message: 'Property listed successfully',
      property: savedProperty
    });
  } catch (err) {
    console.error('Error creating property:', err);
    res.status(400).json({ message: 'Error creating property', error: err.message });
  }
});

/**
 * @route   PUT /api/properties/:id
 * @desc    Update property listing
 * @access  Private (Owner)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }

    // Update property
    Object.assign(property, req.body);
    property.updatedAt = new Date();
    const updatedProperty = await property.save();

    res.json({
      message: 'Property updated successfully',
      property: updatedProperty
    });
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(400).json({ message: 'Error updating property', error: err.message });
  }
});

/**
 * @route   DELETE /api/properties/:id
 * @desc    Delete property listing
 * @access  Private (Owner)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // Check ownership
    if (property.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }

    property.status = 'Cancelled';
    await property.save();

    res.json({ message: 'Property listing cancelled successfully' });
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ message: 'Error deleting property', error: err.message });
  }
});

/**
 * @route   GET /api/properties/province/:province
 * @desc    Get properties by province
 * @access  Public
 */
router.get('/province/:province', async (req, res) => {
  try {
    const province = req.params.province.toUpperCase();
    
    if (!isValidProvince(province)) {
      return res.status(400).json({ 
        message: 'Invalid province code',
        validProvinces: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
      });
    }

    const properties = await Property.find({ 
      province: province,
      status: 'Active'
    })
      .populate('sellerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      province,
      properties,
      count: properties.length
    });
  } catch (err) {
    console.error('Error fetching properties by province:', err);
    res.status(500).json({ message: 'Error fetching properties', error: err.message });
  }
});

/**
 * @route   POST /api/properties/:id/images
 * @desc    Upload property images
 * @access  Private (Owner)
 */
router.post('/:id/images', authenticateToken, upload.array('images', 20), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check ownership
    if (property.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to upload images' });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }
    
    // Add images to property
    const images = req.files.map((file, index) => ({
      url: `/uploads/properties/${file.filename}`,
      caption: req.body.captions?.[index] || '',
      order: (property.images?.length || 0) + index + 1
    }));
    
    if (!property.images) {
      property.images = [];
    }
    property.images.push(...images);
    await property.save();
    
    res.json({
      message: 'Images uploaded successfully',
      images: images,
      totalImages: property.images.length
    });
  } catch (err) {
    console.error('Error uploading images:', err);
    res.status(500).json({ message: 'Error uploading images', error: err.message });
  }
});

/**
 * @route   DELETE /api/properties/:id/images/:imageIndex
 * @desc    Delete property image
 * @access  Private (Owner)
 */
router.delete('/:id/images/:imageIndex', authenticateToken, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Check ownership
    if (property.sellerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const imageIndex = parseInt(req.params.imageIndex);
    
    if (!property.images || imageIndex < 0 || imageIndex >= property.images.length) {
      return res.status(400).json({ message: 'Invalid image index' });
    }
    
    // Remove image
    property.images.splice(imageIndex, 1);
    // Reorder remaining images
    property.images.forEach((img, idx) => {
      img.order = idx + 1;
    });
    await property.save();
    
    res.json({
      message: 'Image deleted successfully',
      remainingImages: property.images.length
    });
  } catch (err) {
    console.error('Error deleting image:', err);
    res.status(500).json({ message: 'Error deleting image', error: err.message });
  }
});

module.exports = router;

