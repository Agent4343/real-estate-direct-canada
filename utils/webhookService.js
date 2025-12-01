/**
 * Webhook Service
 * Handles webhook delivery and retries
 */

const axios = require('axios');
const crypto = require('crypto');
const Webhook = require('../models/Webhook.model');
const WebhookEvent = require('../models/WebhookEvent.model');

/**
 * Generate webhook signature
 */
function generateSignature(payload, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

/**
 * Send webhook event
 */
async function sendWebhook(webhookId, eventType, payload) {
  try {
    const webhook = await Webhook.findById(webhookId);
    
    if (!webhook || !webhook.isActive) {
      return { success: false, error: 'Webhook not found or inactive' };
    }
    
    // Check if webhook subscribes to this event
    if (!webhook.events.includes(eventType)) {
      return { success: false, error: 'Event not subscribed' };
    }
    
    // Create webhook event record
    const webhookEvent = new WebhookEvent({
      webhookId: webhook._id,
      eventType,
      payload,
      status: 'Pending'
    });
    await webhookEvent.save();
    
    // Prepare request
    const signature = generateSignature(payload, webhook.secret);
    const headers = {
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature,
      'X-Webhook-Event': eventType,
      'X-Webhook-Id': webhook._id.toString(),
      ...webhook.headers
    };
    
    // Send webhook
    try {
      const response = await axios.post(webhook.url, payload, {
        headers,
        timeout: 10000 // 10 second timeout
      });
      
      // Update webhook event
      webhookEvent.status = 'Sent';
      webhookEvent.response = {
        statusCode: response.status,
        headers: response.headers,
        body: JSON.stringify(response.data),
        receivedAt: new Date()
      };
      webhookEvent.sentAt = new Date();
      webhookEvent.completedAt = new Date();
      await webhookEvent.save();
      
      // Update webhook stats
      webhook.stats.totalRequests += 1;
      webhook.stats.successCount += 1;
      webhook.stats.lastRequestAt = new Date();
      webhook.stats.lastSuccessAt = new Date();
      await webhook.save();
      
      return { success: true, event: webhookEvent };
    } catch (error) {
      // Handle error
      webhookEvent.status = 'Failed';
      webhookEvent.error = {
        message: error.message,
        code: error.code,
        stack: error.stack
      };
      
      if (webhookEvent.retryCount < webhook.retryConfig.maxRetries) {
        webhookEvent.status = 'Retrying';
        webhookEvent.retryCount += 1;
        const delay = webhook.retryConfig.retryDelay * Math.pow(2, webhookEvent.retryCount - 1); // Exponential backoff
        webhookEvent.nextRetryAt = new Date(Date.now() + delay);
      }
      
      webhookEvent.completedAt = new Date();
      await webhookEvent.save();
      
      // Update webhook stats
      webhook.stats.totalRequests += 1;
      webhook.stats.failureCount += 1;
      webhook.stats.lastRequestAt = new Date();
      webhook.stats.lastFailureAt = new Date();
      await webhook.save();
      
      return { success: false, error: error.message, event: webhookEvent };
    }
  } catch (err) {
    console.error('Error sending webhook:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Process all pending webhooks for an event
 */
async function processWebhookEvent(eventType, payload) {
  try {
    const webhooks = await Webhook.find({
      isActive: true,
      events: eventType
    });
    
    const results = [];
    for (const webhook of webhooks) {
      const result = await sendWebhook(webhook._id, eventType, payload);
      results.push(result);
    }
    
    return results;
  } catch (err) {
    console.error('Error processing webhook event:', err);
    return [];
  }
}

/**
 * Retry failed webhook events
 */
async function retryFailedWebhooks() {
  try {
    const failedEvents = await WebhookEvent.find({
      status: 'Retrying',
      nextRetryAt: { $lte: new Date() }
    }).populate('webhookId');
    
    for (const event of failedEvents) {
      if (event.webhookId && event.webhookId.isActive) {
        await sendWebhook(event.webhookId._id, event.eventType, event.payload);
      }
    }
  } catch (err) {
    console.error('Error retrying webhooks:', err);
  }
}

module.exports = {
  sendWebhook,
  processWebhookEvent,
  retryFailedWebhooks,
  generateSignature
};

