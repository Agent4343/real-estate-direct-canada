const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Property = require('../models/Property.model');
const Transaction = require('../models/Transaction.model');
const Document = require('../models/Document.model');
const Mortgage = require('../models/Mortgage.model');
const Lawyer = require('../models/Lawyer.model');
const AuditLog = require('../models/AuditLog.model');
const { authenticateToken, authorize } = require('../middleware/auth');

/**
 * Admin authentication middleware
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'Admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    next();
  } catch (err) {
    console.error('Error checking admin status:', err);
    res.status(500).json({ message: 'Error verifying admin access' });
  }
};

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get statistics
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const activeTransactions = await Transaction.countDocuments({ status: { $in: ['Offer Made', 'Offer Accepted', 'In Progress'] } });
    const completedTransactions = await Transaction.countDocuments({ status: 'Completed' });
    
    // Revenue statistics
    const transactions = await Transaction.find({ status: 'Completed' });
    const totalRevenue = transactions.reduce((sum, t) => {
      return sum + (t.platformFees?.totalFee || 0);
    }, 0);
    
    // Recent activity
    const recentProperties = await Property.find().sort({ createdAt: -1 }).limit(10).populate('sellerId', 'name email');
    const recentTransactions = await Transaction.find().sort({ createdAt: -1 }).limit(10).populate('buyerId', 'name email').populate('sellerId', 'name email');
    
    // User statistics by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    res.json({
      statistics: {
        users: {
          total: totalUsers,
          byRole: usersByRole
        },
        properties: {
          total: totalProperties,
          active: await Property.countDocuments({ status: 'Active' })
        },
        transactions: {
          total: totalTransactions,
          active: activeTransactions,
          completed: completedTransactions
        },
        revenue: {
          total: totalRevenue,
          thisMonth: 0, // TODO: Calculate monthly revenue
          thisYear: 0   // TODO: Calculate yearly revenue
        }
      },
      recentActivity: {
        properties: recentProperties,
        transactions: recentTransactions
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    res.status(500).json({ message: 'Error fetching dashboard data', error: err.message });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users (with filtering)
 * @access  Private (Admin)
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { role, status, province, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (role) query.role = role;
    if (status) query.status = status;
    if (province) query.province = province.toUpperCase();
    
    const skip = (page - 1) * limit;
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

/**
 * @route   GET /api/admin/properties
 * @desc    Get all properties (admin view)
 * @access  Private (Admin)
 */
router.get('/properties', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, province, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (province) query.province = province.toUpperCase();
    
    const skip = (page - 1) * limit;
    
    const properties = await Property.find(query)
      .populate('sellerId', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Property.countDocuments(query);
    
    res.json({
      properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalProperties: total
      }
    });
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ message: 'Error fetching properties', error: err.message });
  }
});

/**
 * @route   GET /api/admin/transactions
 * @desc    Get all transactions (admin view)
 * @access  Private (Admin)
 */
router.get('/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, province, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (province) query.province = province.toUpperCase();
    
    const skip = (page - 1) * limit;
    
    const transactions = await Transaction.find(query)
      .populate('buyerId', 'name email')
      .populate('sellerId', 'name email')
      .populate('propertyId', 'title price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      transactions,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalTransactions: total
      }
    });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ message: 'Error fetching transactions', error: err.message });
  }
});

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs (compliance tracking)
 * @access  Private (Admin)
 */
router.get('/audit-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      eventType,
      userId,
      province,
      complianceRelevant,
      startDate,
      endDate,
      page = 1,
      limit = 100
    } = req.query;
    
    const query = {};
    if (eventType) query.eventType = eventType;
    if (userId) query.userId = userId;
    if (province) query.province = province.toUpperCase();
    if (complianceRelevant === 'true') query.complianceRelevant = true;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const skip = (page - 1) * limit;
    
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await AuditLog.countDocuments(query);
    
    res.json({
      logs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalLogs: total
      }
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ message: 'Error fetching audit logs', error: err.message });
  }
});

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status (suspend, activate, etc.)
 * @access  Private (Admin)
 */
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    if (!['Active', 'Inactive', 'Suspended', 'Pending Verification'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const oldStatus = user.status;
    user.status = status;
    await user.save();
    
    // Log admin action
    const AuditLog = require('../models/AuditLog.model');
    await AuditLog.log({
      eventType: 'ADMIN_ACTION',
      userId: req.user.userId,
      targetType: 'User',
      targetId: id,
      description: `User status changed from ${oldStatus} to ${status}`,
      details: { oldStatus, newStatus: status, adminId: req.user.userId }
    });
    
    res.json({
      message: 'User status updated successfully',
      user: {
        id: user._id,
        email: user.email,
        status: user.status
      }
    });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ message: 'Error updating user status', error: err.message });
  }
});

/**
 * @route   PUT /api/admin/properties/:id/status
 * @desc    Update property status (admin override)
 * @access  Private (Admin)
 */
router.put('/properties/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const oldStatus = property.status;
    property.status = status;
    await property.save();
    
    res.json({
      message: 'Property status updated successfully',
      property: {
        id: property._id,
        title: property.title,
        status: property.status
      }
    });
  } catch (err) {
    console.error('Error updating property status:', err);
    res.status(500).json({ message: 'Error updating property status', error: err.message });
  }
});

/**
 * @route   POST /api/admin/mortgages
 * @desc    Create/manage mortgage listings
 * @access  Private (Admin)
 */
router.post('/mortgages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const mortgage = new Mortgage({
      ...req.body,
      createdBy: req.user.userId
    });
    
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

/**
 * @route   POST /api/admin/lawyers
 * @desc    Create/manage lawyer listings
 * @access  Private (Admin)
 */
router.post('/lawyers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const lawyer = new Lawyer({
      ...req.body,
      createdBy: req.user.userId,
      status: 'Pending Verification'
    });
    
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

/**
 * @route   GET /api/admin/compliance-report
 * @desc    Get compliance report for province
 * @access  Private (Admin)
 */
router.get('/compliance-report', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { province, startDate, endDate } = req.query;
    
    if (!province) {
      return res.status(400).json({ message: 'Province is required' });
    }
    
    const logs = await AuditLog.getComplianceLogs(
      province.toUpperCase(),
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
    
    // Group by event type
    const eventsByType = {};
    logs.forEach(log => {
      if (!eventsByType[log.eventType]) {
        eventsByType[log.eventType] = [];
      }
      eventsByType[log.eventType].push(log);
    });
    
    res.json({
      province: province.toUpperCase(),
      period: {
        start: startDate || 'All time',
        end: endDate || 'Now'
      },
      totalComplianceEvents: logs.length,
      eventsByType,
      logs: logs.slice(0, 100) // Latest 100
    });
  } catch (err) {
    console.error('Error generating compliance report:', err);
    res.status(500).json({ message: 'Error generating compliance report', error: err.message });
  }
});

module.exports = router;

