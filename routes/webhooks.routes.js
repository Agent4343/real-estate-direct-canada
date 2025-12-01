const express = require('express');
const router = express.Router();
const Webhook = require('../models/Webhook.model');
const WebhookEvent = require('../models/WebhookEvent.model');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route   POST /api/webhooks
 * @desc    Create a new webhook
 * @access  Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      description,
      url,
      events,
      headers
    } = req.body;
    
    if (!name || !url || !events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ 
        message: 'Name, URL, and events array are required' 
      });
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid URL format' });
    }
    
    const webhook = new Webhook({
      userId: req.user.userId,
      name,
      description,
      url,
      events,
      headers: headers || {}
    });
    
    await webhook.save();
    
    res.status(201).json({
      message: 'Webhook created successfully',
      webhook: {
        id: webhook._id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret // Important: Return secret only on creation
      }
    });
  } catch (err) {
    console.error('Error creating webhook:', err);
    res.status(400).json({ message: 'Error creating webhook', error: err.message });
  }
});

/**
 * @route   GET /api/webhooks
 * @desc    Get user's webhooks
 * @access  Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const webhooks = await Webhook.find({ userId: req.user.userId })
      .select('-secret') // Don't expose secrets
      .sort({ createdAt: -1 });
    
    res.json({
      webhooks,
      count: webhooks.length
    });
  } catch (err) {
    console.error('Error fetching webhooks:', err);
    res.status(500).json({ message: 'Error fetching webhooks', error: err.message });
  }
});

/**
 * @route   GET /api/webhooks/:id
 * @desc    Get webhook details
 * @access  Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const webhook = await Webhook.findOne({
      _id: req.params.id,
      userId: req.user.userId
    }).select('-secret'); // Don't expose secret
    
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    // Get recent events
    const recentEvents = await WebhookEvent.find({ webhookId: webhook._id })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      webhook,
      recentEvents
    });
  } catch (err) {
    console.error('Error fetching webhook:', err);
    res.status(500).json({ message: 'Error fetching webhook', error: err.message });
  }
});

/**
 * @route   PUT /api/webhooks/:id
 * @desc    Update webhook
 * @access  Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const webhook = await Webhook.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    const { name, description, url, events, headers, isActive } = req.body;
    
    if (name) webhook.name = name;
    if (description !== undefined) webhook.description = description;
    if (url) {
      try {
        new URL(url);
        webhook.url = url;
      } catch (err) {
        return res.status(400).json({ message: 'Invalid URL format' });
      }
    }
    if (events) webhook.events = events;
    if (headers) webhook.headers = headers;
    if (isActive !== undefined) webhook.isActive = isActive;
    
    webhook.updatedAt = new Date();
    await webhook.save();
    
    res.json({
      message: 'Webhook updated successfully',
      webhook: {
        id: webhook._id,
        name: webhook.name,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive
      }
    });
  } catch (err) {
    console.error('Error updating webhook:', err);
    res.status(400).json({ message: 'Error updating webhook', error: err.message });
  }
});

/**
 * @route   DELETE /api/webhooks/:id
 * @desc    Delete webhook
 * @access  Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const webhook = await Webhook.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    await webhook.deleteOne();
    
    res.json({ message: 'Webhook deleted successfully' });
  } catch (err) {
    console.error('Error deleting webhook:', err);
    res.status(500).json({ message: 'Error deleting webhook', error: err.message });
  }
});

/**
 * @route   GET /api/webhooks/:id/events
 * @desc    Get webhook delivery events
 * @access  Private
 */
router.get('/:id/events', authenticateToken, async (req, res) => {
  try {
    const webhook = await Webhook.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    const { page = 1, limit = 50, status } = req.query;
    const skip = (page - 1) * limit;
    
    const query = { webhookId: webhook._id };
    if (status) query.status = status;
    
    const events = await WebhookEvent.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select('-payload'); // Don't send full payload in list view
    
    const total = await WebhookEvent.countDocuments(query);
    
    res.json({
      events,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / limit),
        totalEvents: total
      }
    });
  } catch (err) {
    console.error('Error fetching webhook events:', err);
    res.status(500).json({ message: 'Error fetching events', error: err.message });
  }
});

/**
 * @route   POST /api/webhooks/:id/test
 * @desc    Test webhook with sample payload
 * @access  Private
 */
router.post('/:id/test', authenticateToken, async (req, res) => {
  try {
    const webhook = await Webhook.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });
    
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }
    
    const { processWebhookEvent } = require('../utils/webhookService');
    
    const testPayload = req.body.payload || {
      test: true,
      timestamp: new Date().toISOString()
    };
    
    const result = await processWebhookEvent('test.event', testPayload);
    
    res.json({
      message: 'Test webhook sent',
      result
    });
  } catch (err) {
    console.error('Error testing webhook:', err);
    res.status(500).json({ message: 'Error testing webhook', error: err.message });
  }
});

module.exports = router;

