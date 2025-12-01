const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics.model');
const { authenticateToken } = require('../middleware/auth');

/**
 * Analytics tracking middleware
 */
function trackEvent(req, eventType, metadata = {}) {
  try {
    // Don't block request if analytics fails
    setImmediate(async () => {
      try {
        const analytics = new Analytics({
          eventType,
          userId: req.user?.userId || null,
          sessionId: req.sessionID,
          metadata,
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('user-agent'),
          referrer: req.get('referer'),
          url: req.originalUrl
        });
        await analytics.save();
      } catch (err) {
        console.error('Error tracking analytics:', err);
      }
    });
  } catch (err) {
    // Silently fail
  }
}

/**
 * @route   GET /api/analytics/stats
 * @desc    Get platform statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Check if admin - simplified for now
    // In production, use proper admin middleware
    
    const { startDate, endDate, province, eventType } = req.query;
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }
    if (province) matchStage.province = province.toUpperCase();
    if (eventType) matchStage.eventType = eventType;
    
    // Overall statistics
    const totalEvents = await Analytics.countDocuments(matchStage);
    
    // Events by type
    const eventsByType = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Events by province
    const eventsByProvince = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$province',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Events by device
    const eventsByDevice = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$device',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Daily activity
    const dailyActivity = await Analytics.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 } // Last 30 days
    ]);
    
    // Most viewed properties
    const topProperties = await Analytics.aggregate([
      {
        $match: {
          eventType: 'property_view',
          ...matchStage
        }
      },
      {
        $group: {
          _id: '$propertyId',
          views: { $sum: 1 }
        }
      },
      { $sort: { views: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      period: {
        start: startDate || 'All time',
        end: endDate || 'Now'
      },
      statistics: {
        totalEvents,
        eventsByType,
        eventsByProvince,
        eventsByDevice,
        dailyActivity,
        topProperties
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
});

/**
 * @route   GET /api/analytics/property/:propertyId
 * @desc    Get analytics for a specific property
 * @access  Private (Property Owner or Admin)
 */
router.get('/property/:propertyId', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchStage = { propertyId: req.params.propertyId };
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }
    
    // View count
    const views = await Analytics.countDocuments({
      ...matchStage,
      eventType: 'property_view'
    });
    
    // Favorites
    const favorites = await Analytics.countDocuments({
      ...matchStage,
      eventType: 'property_favorite'
    });
    
    // Views over time
    const viewsOverTime = await Analytics.aggregate([
      {
        $match: {
          ...matchStage,
          eventType: 'property_view'
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);
    
    // Referrer sources
    const referrers = await Analytics.aggregate([
      {
        $match: {
          ...matchStage,
          eventType: 'property_view',
          referrer: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: '$referrer',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      propertyId: req.params.propertyId,
      statistics: {
        totalViews: views,
        totalFavorites: favorites,
        viewsOverTime,
        topReferrers: referrers
      }
    });
  } catch (err) {
    console.error('Error fetching property analytics:', err);
    res.status(500).json({ message: 'Error fetching property analytics', error: err.message });
  }
});

module.exports = {
  router,
  trackEvent
};

