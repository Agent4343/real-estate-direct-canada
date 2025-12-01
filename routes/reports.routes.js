const express = require('express');
const router = express.Router();
const Report = require('../models/Report.model');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/reports
 * @desc    Create a new report
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      reportType,
      reportedId,
      reportedType,
      reason,
      description,
      evidence
    } = req.body;
    
    if (!reportType || !reportedId || !reason || !description) {
      return res.status(400).json({ 
        message: 'Report type, reported ID, reason, and description are required' 
      });
    }
    
    // Check if user already reported this item
    const existingReport = await Report.findOne({
      reporterId: req.user.userId,
      reportType,
      reportedId
    });
    
    if (existingReport && existingReport.status === 'Pending') {
      return res.status(400).json({ 
        message: 'You have already reported this item',
        existingReport: {
          id: existingReport._id,
          status: existingReport.status
        }
      });
    }
    
    // Determine priority based on reason
    let priority = 'Normal';
    if (['Fraud', 'Harassment', 'False Listing'].includes(reason)) {
      priority = 'High';
    }
    
    const report = new Report({
      reporterId: req.user.userId,
      reportType,
      reportedId,
      reportedType: reportedType || reportType,
      reason,
      description,
      evidence: evidence || {},
      priority
    });
    
    await report.save();
    
    res.status(201).json({
      message: 'Report submitted successfully',
      report: {
        id: report._id,
        status: report.status,
        priority: report.priority
      }
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(400).json({ message: 'Error creating report', error: err.message });
  }
});

/**
 * @route   GET /api/reports/my-reports
 * @desc    Get user's reports
 * @access  Private
 */
router.get('/my-reports', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { reporterId: req.user.userId };
    if (status) query.status = status;
    
    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Report.countDocuments(query);
    
    res.json({
      reports,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalReports: total
      }
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json({ message: 'Error fetching reports', error: err.message });
  }
});

/**
 * @route   GET /api/reports/:id
 * @desc    Get report details
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // Only reporter or admin can view
    if (report.reporterId.toString() !== req.user.userId && req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Not authorized to view this report' });
    }
    
    res.json({ report });
  } catch (err) {
    console.error('Error fetching report:', err);
    res.status(500).json({ message: 'Error fetching report', error: err.message });
  }
});

module.exports = router;

