const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification.model');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      isRead, 
      type, 
      page = 1, 
      limit = 50,
      priority 
    } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { userId: req.user.userId };
    
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    if (type) {
      query.type = type;
    }
    if (priority) {
      query.priority = priority;
    }
    
    const notifications = await Notification.find(query)
      .populate('propertyId', 'title price images')
      .populate('transactionId', 'status offerPrice')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false
    });
    
    res.json({
      notifications,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalNotifications: total
      },
      unreadCount
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ message: 'Error fetching notifications', error: err.message });
  }
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread notification count
 * @access  Private
 */
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user.userId,
      isRead: false
    });
    
    res.json({ unreadCount: count });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({ message: 'Error fetching unread count', error: err.message });
  }
});

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.json({ message: 'Notification marked as read', notification });
  } catch (err) {
    console.error('Error marking notification as read:', err);
    res.status(500).json({ message: 'Error updating notification', error: err.message });
  }
});

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        userId: req.user.userId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );
    
    res.json({
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount
    });
  } catch (err) {
    console.error('Error marking all as read:', err);
    res.status(500).json({ message: 'Error updating notifications', error: err.message });
  }
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    await notification.deleteOne();
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error('Error deleting notification:', err);
    res.status(500).json({ message: 'Error deleting notification', error: err.message });
  }
});

/**
 * @route   DELETE /api/notifications/read/all
 * @desc    Delete all read notifications
 * @access  Private
 */
router.delete('/read/all', authenticateToken, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      userId: req.user.userId,
      isRead: true
    });
    
    res.json({
      message: 'All read notifications deleted',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('Error deleting read notifications:', err);
    res.status(500).json({ message: 'Error deleting notifications', error: err.message });
  }
});

module.exports = router;

