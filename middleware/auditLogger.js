/**
 * Audit Logging Middleware
 * Automatically logs all important activities for compliance tracking
 */

const AuditLog = require('../models/AuditLog.model');

/**
 * Create audit log entry
 */
async function createAuditLog(req, eventType, targetType, targetId, description, details = {}) {
  try {
    const userInfo = req.user || {};
    
    const auditData = {
      eventType,
      userId: userInfo.userId || null,
      userEmail: userInfo.email || null,
      userRole: userInfo.role || null,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      targetType,
      targetId,
      description,
      details: {
        ...details,
        method: req.method,
        path: req.path,
        query: req.query,
        body: sanitizeRequestBody(req.body) // Remove sensitive data
      },
      requestId: req.id || generateRequestId(),
      sessionId: req.sessionID || null,
      timestamp: new Date()
    };
    
    // Determine if compliance-relevant
    if (['OFFER_MADE', 'OFFER_ACCEPTED', 'TRANSACTION_COMPLETED', 'DOCUMENT_SIGNED', 'TERMS_ACCEPTED'].includes(eventType)) {
      auditData.complianceRelevant = true;
    }
    
    await AuditLog.log(auditData);
  } catch (err) {
    // Log error but don't break request
    console.error('Audit logging error:', err);
  }
}

/**
 * Sanitize request body to remove sensitive data
 */
function sanitizeRequestBody(body) {
  if (!body || typeof body !== 'object') return body;
  
  const sensitiveFields = ['password', 'token', 'secret', 'privateKey', 'creditCard', 'ssn'];
  const sanitized = { ...body };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Generate request ID
 */
function generateRequestId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Audit logging middleware
 */
const auditLogger = async (req, res, next) => {
  // Generate request ID
  req.id = generateRequestId();
  
  // Log request start
  const startTime = Date.now();
  
  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const duration = Date.now() - startTime;
    
    // Log successful requests
    if (res.statusCode < 400) {
      // Determine event type based on route
      const eventType = determineEventType(req.method, req.path);
      if (eventType) {
        createAuditLog(req, eventType, null, null, `${req.method} ${req.path} - Success`, {
          statusCode: res.statusCode,
          duration
        });
      }
    }
    
    return originalJson(data);
  };
  
  next();
};

/**
 * Determine event type from request
 */
function determineEventType(method, path) {
  // Authentication
  if (path.includes('/auth/register') && method === 'POST') return 'USER_REGISTERED';
  if (path.includes('/auth/login') && method === 'POST') return 'USER_LOGIN';
  
  // Properties
  if (path.includes('/properties') && method === 'POST') return 'PROPERTY_CREATED';
  if (path.includes('/properties') && method === 'PUT') return 'PROPERTY_UPDATED';
  if (path.includes('/properties') && method === 'DELETE') return 'PROPERTY_DELETED';
  if (path.includes('/properties') && method === 'GET' && path.includes('/:id')) return 'PROPERTY_VIEWED';
  
  // Transactions
  if (path.includes('/transactions/offer') && method === 'POST') return 'OFFER_MADE';
  if (path.includes('/transactions') && path.includes('/accept') && method === 'PUT') return 'OFFER_ACCEPTED';
  if (path.includes('/transactions') && path.includes('/reject') && method === 'PUT') return 'OFFER_REJECTED';
  
  // Documents
  if (path.includes('/documents/upload') && method === 'POST') return 'DOCUMENT_UPLOADED';
  if (path.includes('/documents') && path.includes('/status') && method === 'PUT') return 'DOCUMENT_APPROVED';
  
  // Legal
  if (path.includes('/legal/accept-terms') && method === 'POST') return 'TERMS_ACCEPTED';
  if (path.includes('/legal/acknowledge-province') && method === 'POST') return 'PROVINCE_ACKNOWLEDGED';
  
  return null; // Not all requests need logging
}

/**
 * Manual audit log creation helper
 */
async function logEvent(req, eventType, description, details = {}) {
  return await createAuditLog(req, eventType, null, null, description, details);
}

/**
 * Log property event
 */
async function logPropertyEvent(req, eventType, propertyId, description, details = {}) {
  return await createAuditLog(req, eventType, 'Property', propertyId, description, details);
}

/**
 * Log transaction event
 */
async function logTransactionEvent(req, eventType, transactionId, description, details = {}) {
  return await createAuditLog(req, eventType, 'Transaction', transactionId, description, details);
}

/**
 * Log document event
 */
async function logDocumentEvent(req, eventType, documentId, description, details = {}) {
  return await createAuditLog(req, eventType, 'Document', documentId, description, details);
}

module.exports = {
  auditLogger,
  createAuditLog,
  logEvent,
  logPropertyEvent,
  logTransactionEvent,
  logDocumentEvent
};

