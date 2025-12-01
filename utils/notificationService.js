/**
 * Notification Service
 * Helper functions to create notifications for users
 */

const Notification = require('../models/Notification.model');

/**
 * Create a notification
 */
async function createNotification(userId, notificationData) {
  try {
    const notification = new Notification({
      userId,
      ...notificationData,
      createdAt: new Date()
    });
    
    await notification.save();
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err);
    return null;
  }
}

/**
 * Notify user about new offer
 */
async function notifyNewOffer(sellerId, transactionId, offerAmount) {
  return await createNotification(sellerId, {
    type: 'NewOffer',
    title: 'New Offer Received',
    message: `You received a new offer of $${offerAmount.toLocaleString()} on your property.`,
    transactionId,
    priority: 'High',
    actionUrl: `/transactions/${transactionId}`
  });
}

/**
 * Notify user about offer acceptance
 */
async function notifyOfferAccepted(buyerId, transactionId) {
  return await createNotification(buyerId, {
    type: 'OfferAccepted',
    title: 'Offer Accepted!',
    message: 'Congratulations! Your offer has been accepted.',
    transactionId,
    priority: 'High',
    actionUrl: `/transactions/${transactionId}`
  });
}

/**
 * Notify user about offer rejection
 */
async function notifyOfferRejected(buyerId, transactionId) {
  return await createNotification(buyerId, {
    type: 'OfferRejected',
    title: 'Offer Not Accepted',
    message: 'Your offer was not accepted by the seller.',
    transactionId,
    priority: 'Normal',
    actionUrl: `/transactions/${transactionId}`
  });
}

/**
 * Notify user about new message
 */
async function notifyNewMessage(userId, transactionId, senderName) {
  return await createNotification(userId, {
    type: 'NewMessage',
    title: 'New Message',
    message: `You have a new message from ${senderName}.`,
    transactionId,
    priority: 'Normal',
    actionUrl: `/messages/transaction/${transactionId}`
  });
}

/**
 * Notify user about property update
 */
async function notifyPropertyUpdate(userId, propertyId, message) {
  return await createNotification(userId, {
    type: 'PropertyUpdate',
    title: 'Property Update',
    message,
    propertyId,
    priority: 'Normal',
    actionUrl: `/properties/${propertyId}`
  });
}

/**
 * Notify user about new property matches
 */
async function notifyNewMatch(userId, propertyId, searchName) {
  return await createNotification(userId, {
    type: 'NewMatch',
    title: 'New Property Match',
    message: `A new property matches your saved search: "${searchName}"`,
    propertyId,
    priority: 'Normal',
    actionUrl: `/properties/${propertyId}`
  });
}

/**
 * Notify user about document requirement
 */
async function notifyDocumentRequired(userId, transactionId, documentType) {
  return await createNotification(userId, {
    type: 'DocumentRequired',
    title: 'Document Required',
    message: `Please submit your ${documentType} document for this transaction.`,
    transactionId,
    priority: 'High',
    actionUrl: `/transactions/${transactionId}/documents`
  });
}

/**
 * Notify user about document approval
 */
async function notifyDocumentApproved(userId, documentId, documentType) {
  return await createNotification(userId, {
    type: 'DocumentApproved',
    title: 'Document Approved',
    message: `Your ${documentType} document has been approved.`,
    documentId,
    priority: 'Normal',
    actionUrl: `/documents/${documentId}`
  });
}

/**
 * Notify user about transaction update
 */
async function notifyTransactionUpdate(userId, transactionId, message) {
  return await createNotification(userId, {
    type: 'TransactionUpdate',
    title: 'Transaction Update',
    message,
    transactionId,
    priority: 'Normal',
    actionUrl: `/transactions/${transactionId}`
  });
}

/**
 * Notify multiple users
 */
async function notifyMultipleUsers(userIds, notificationData) {
  const notifications = [];
  for (const userId of userIds) {
    const notification = await createNotification(userId, notificationData);
    if (notification) notifications.push(notification);
  }
  return notifications;
}

module.exports = {
  createNotification,
  notifyNewOffer,
  notifyOfferAccepted,
  notifyOfferRejected,
  notifyNewMessage,
  notifyPropertyUpdate,
  notifyNewMatch,
  notifyDocumentRequired,
  notifyDocumentApproved,
  notifyTransactionUpdate,
  notifyMultipleUsers
};

