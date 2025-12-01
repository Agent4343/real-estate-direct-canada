const express = require('express');
const router = express.Router();
const {
  calculatePayment,
  calculateAffordability,
  generateAmortizationSchedule,
  calculatePrepaymentImpact
} = require('../utils/mortgageCalculator');

/**
 * @route   POST /api/mortgage-calculator/payment
 * @desc    Calculate monthly mortgage payment
 * @access  Public
 */
router.post('/payment', (req, res) => {
  try {
    const { principal, annualRate, years } = req.body;
    
    if (!principal || !annualRate || !years) {
      return res.status(400).json({ 
        message: 'Principal, annual rate, and years are required' 
      });
    }
    
    const result = calculatePayment(
      Number(principal),
      Number(annualRate),
      Number(years)
    );
    
    res.json({
      message: 'Payment calculation successful',
      calculation: result
    });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error calculating payment', 
      error: err.message 
    });
  }
});

/**
 * @route   POST /api/mortgage-calculator/affordability
 * @desc    Calculate maximum affordable mortgage
 * @access  Public
 */
router.post('/affordability', (req, res) => {
  try {
    const {
      monthlyIncome,
      monthlyDebts = 0,
      annualRate,
      years,
      maxDebtRatio = 0.32
    } = req.body;
    
    if (!monthlyIncome || !annualRate || !years) {
      return res.status(400).json({ 
        message: 'Monthly income, annual rate, and years are required' 
      });
    }
    
    const result = calculateAffordability(
      Number(monthlyIncome),
      Number(monthlyDebts),
      Number(annualRate),
      Number(years),
      Number(maxDebtRatio)
    );
    
    res.json({
      message: 'Affordability calculation successful',
      calculation: result
    });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error calculating affordability', 
      error: err.message 
    });
  }
});

/**
 * @route   POST /api/mortgage-calculator/schedule
 * @desc    Generate amortization schedule
 * @access  Public
 */
router.post('/schedule', (req, res) => {
  try {
    const { principal, annualRate, years, startDate } = req.body;
    
    if (!principal || !annualRate || !years) {
      return res.status(400).json({ 
        message: 'Principal, annual rate, and years are required' 
      });
    }
    
    const schedule = generateAmortizationSchedule(
      Number(principal),
      Number(annualRate),
      Number(years),
      startDate ? new Date(startDate) : new Date()
    );
    
    // Limit to first 12 months for API response (can be paginated)
    const limit = req.query.limit ? Number(req.query.limit) : 12;
    const page = req.query.page ? Number(req.query.page) : 1;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    res.json({
      message: 'Amortization schedule generated',
      schedule: schedule.slice(start, end),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(schedule.length / limit),
        totalPayments: schedule.length,
        showing: `${start + 1}-${Math.min(end, schedule.length)}`
      },
      summary: {
        totalPayments: schedule.length,
        totalInterest: schedule.reduce((sum, p) => sum + p.interest, 0),
        totalPrincipal: schedule.reduce((sum, p) => sum + p.principal, 0)
      }
    });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error generating schedule', 
      error: err.message 
    });
  }
});

/**
 * @route   POST /api/mortgage-calculator/prepayment
 * @desc    Calculate prepayment impact
 * @access  Public
 */
router.post('/prepayment', (req, res) => {
  try {
    const {
      principal,
      annualRate,
      years,
      prepaymentAmount,
      prepaymentMonth
    } = req.body;
    
    if (!principal || !annualRate || !years || !prepaymentAmount || !prepaymentMonth) {
      return res.status(400).json({ 
        message: 'All fields are required: principal, annualRate, years, prepaymentAmount, prepaymentMonth' 
      });
    }
    
    const result = calculatePrepaymentImpact(
      Number(principal),
      Number(annualRate),
      Number(years),
      Number(prepaymentAmount),
      Number(prepaymentMonth)
    );
    
    res.json({
      message: 'Prepayment impact calculated',
      calculation: result
    });
  } catch (err) {
    res.status(400).json({ 
      message: 'Error calculating prepayment impact', 
      error: err.message 
    });
  }
});

module.exports = router;

