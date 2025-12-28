const express = require('express');
const router = express.Router();
const Mortgage = require('../models/Mortgage.model');
const { isValidProvince } = require('../config/provincialRegulations');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/mortgages
 * @desc    Get all mortgages with filtering
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      province,
      mortgageType,
      term,
      minRate,
      maxRate,
      minDownPayment,
      maxLoanAmount,
      available,
      page = 1,
      limit = 20,
      sortBy = 'interestRate',
      sortOrder = 'asc'
    } = req.query;

    const query = { status: 'Active' };

    if (province) {
      if (!isValidProvince(province)) {
        return res.status(400).json({ 
          message: 'Invalid province code'
        });
      }
      query.provinces = province.toUpperCase();
    }

    if (mortgageType) {
      query.mortgageType = mortgageType;
    }

    if (term) {
      query.term = Number(term);
    }

    if (minRate || maxRate) {
      query.interestRate = {};
      if (minRate) query.interestRate.$gte = Number(minRate);
      if (maxRate) query.interestRate.$lte = Number(maxRate);
    }

    if (minDownPayment) {
      query.minDownPayment = { $lte: Number(minDownPayment) };
    }

    if (maxLoanAmount) {
      query.$or = [
        { maxLoanAmount: { $gte: Number(maxLoanAmount) } },
        { maxLoanAmount: null }
      ];
    }

    if (available !== undefined) {
      query.available = available === 'true';
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const mortgages = await Mortgage.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    const total = await Mortgage.countDocuments(query);

    res.json({
      mortgages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalMortgages: total
      }
    });
  } catch (err) {
    console.error('Error fetching mortgages:', err);
    res.status(500).json({ message: 'Error fetching mortgages', error: err.message });
  }
});

/**
 * Shared handler for fetching best mortgage offers
 */
async function handleGetBestMortgages(req, res) {
  try {
    const {
      loanAmount,
      downPayment,
      term
    } = req.query;
    const province = (req.query.province || req.params?.province || '').toUpperCase();

    if (!province || !isValidProvince(province)) {
      return res.status(400).json({ 
        message: 'Valid province is required',
        validProvinces: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
      });
    }

    const mortgages = await Mortgage.findBestMortgages(
      province,
      loanAmount ? Number(loanAmount) : null,
      downPayment ? Number(downPayment) : null,
      { limit: 10 }
    );

    res.json({
      province,
      criteria: {
        loanAmount: loanAmount ? Number(loanAmount) : null,
        downPayment: downPayment ? Number(downPayment) : null,
        term: term ? Number(term) : null
      },
      mortgages,
      count: mortgages.length
    });
  } catch (err) {
    console.error('Error fetching best mortgages:', err);
    res.status(500).json({ message: 'Error fetching best mortgages', error: err.message });
  }
}

/**
 * @route   GET /api/mortgages/best
 * @desc    Get best mortgage offers for specific criteria via query params
 * @access  Public
 */
router.get('/best', handleGetBestMortgages);

/**
 * @route   GET /api/mortgages/best/:province
 * @desc    Backwards-compatible path param support for best mortgages
 * @access  Public
 */
router.get('/best/:province', (req, res) => {
  if (!req.query.province) {
    req.query.province = req.params.province;
  }
  return handleGetBestMortgages(req, res);
});

/**
 * @route   GET /api/mortgages/province/:province
 * @desc    Get mortgages by province
 * @access  Public
 */
router.get('/province/:province', async (req, res) => {
  try {
    const province = req.params.province.toUpperCase();
    
    if (!isValidProvince(province)) {
      return res.status(400).json({ 
        message: 'Invalid province code'
      });
    }

    const mortgages = await Mortgage.find({
      provinces: province,
      status: 'Active',
      available: true
    })
      .sort({ priority: -1, interestRate: 1 });

    res.json({
      province,
      mortgages,
      count: mortgages.length
    });
  } catch (err) {
    console.error('Error fetching mortgages by province:', err);
    res.status(500).json({ message: 'Error fetching mortgages', error: err.message });
  }
});

/**
 * @route   GET /api/mortgages/:id
 * @desc    Get single mortgage by ID
 * @access  Public
 */
router.get('/:id', async (req, res) => {
  try {
    const mortgage = await Mortgage.findById(req.params.id);

    if (!mortgage) {
      return res.status(404).json({ message: 'Mortgage not found' });
    }

    // Increment click count
    mortgage.clicks += 1;
    await mortgage.save();

    res.json(mortgage);
  } catch (err) {
    console.error('Error fetching mortgage:', err);
    res.status(500).json({ message: 'Error fetching mortgage', error: err.message });
  }
});

/**
 * @route   POST /api/mortgages/:id/apply
 * @desc    Record mortgage application interest
 * @access  Private
 */
router.post('/:id/apply', authenticateToken, async (req, res) => {
  try {
    const mortgage = await Mortgage.findById(req.params.id);

    if (!mortgage) {
      return res.status(404).json({ message: 'Mortgage not found' });
    }

    // Increment application count
    mortgage.applications += 1;
    await mortgage.save();

    res.json({
      message: 'Application interest recorded',
      mortgage: {
        id: mortgage._id,
        bankName: mortgage.bankName,
        contactInfo: mortgage.contactInfo
      }
    });
  } catch (err) {
    console.error('Error recording application:', err);
    res.status(500).json({ message: 'Error recording application', error: err.message });
  }
});

/**
 * @route   POST /api/mortgages
 * @desc    Create new mortgage listing (Admin only)
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    // TODO: Add admin check middleware
    
    const mortgage = new Mortgage(req.body);
    const savedMortgage = await mortgage.save();

    res.status(201).json({
      message: 'Mortgage listing created successfully',
      mortgage: savedMortgage
    });
  } catch (err) {
    console.error('Error creating mortgage:', err);
    res.status(400).json({ message: 'Error creating mortgage', error: err.message });
  }
});

module.exports = router;

