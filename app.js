const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const mortgageRoutes = require('./routes/mortgage.routes');
const lawyerRoutes = require('./routes/lawyer.routes');
const legalRoutes = require('./routes/legal.routes');
const transactionRoutes = require('./routes/transaction.routes');
const documentRoutes = require('./routes/document.routes');
const docusignRoutes = require('./routes/docusign.routes');
const adminRoutes = require('./routes/admin.routes');
const messagingRoutes = require('./routes/messaging.routes');
const paymentRoutes = require('./routes/payment.routes');
const savedSearchesRoutes = require('./routes/saved-searches.routes');
const favoritesRoutes = require('./routes/favorites.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const reviewsRoutes = require('./routes/reviews.routes');
const webhooksRoutes = require('./routes/webhooks.routes');
const reportsRoutes = require('./routes/reports.routes');
const analyticsRoutes = require('./routes/analytics.routes').router;
const comparisonRoutes = require('./routes/comparison.routes');
const mortgageCalculatorRoutes = require('./routes/mortgage-calculator.routes');
const { auditLogger } = require('./middleware/auditLogger');

// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Security Middleware
app.use(helmet()); // Set security headers

// CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body Parser Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Audit Logging Middleware (must be before routes)
app.use(auditLogger);

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files (documents and images)
app.use('/uploads', express.static('uploads'));

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Real Estate Direct Platform'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/mortgages', mortgageRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/documents/docusign', docusignRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/saved-searches', savedSearchesRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/comparison', comparisonRoutes);
app.use('/api/mortgage-calculator', mortgageCalculatorRoutes);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: 'Real Estate Direct Platform API',
    version: '1.0.0',
    description: 'One-stop shop for buying and selling real estate in Canada',
      endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      mortgages: '/api/mortgages',
      lawyers: '/api/lawyers',
      legal: '/api/legal',
      transactions: '/api/transactions',
      documents: '/api/documents',
      docusign: '/api/documents/docusign',
      admin: '/api/admin',
      messaging: '/api/messaging',
      payments: '/api/payments',
      webhooks: '/api/webhooks',
      reports: '/api/reports',
      analytics: '/api/analytics',
      comparison: '/api/comparison',
      mortgageCalculator: '/api/mortgage-calculator',
      apiDocs: '/api-docs',
      health: '/health'
    },
    provinces: ['BC', 'AB', 'SK', 'MB', 'ON', 'QC', 'NB', 'NS', 'PE', 'NL', 'YT', 'NT', 'NU']
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Database Connection
mongoose.connect(process.env.DB_CONNECTION, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    console.log('✅ Connected to MongoDB database');
  })
  .catch((err) => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Start Server
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║   Real Estate Direct Platform - API Server             ║
╠════════════════════════════════════════════════════════╣
║   Environment: ${NODE_ENV.padEnd(37)}║
║   Server:      http://localhost:${PORT.toString().padEnd(29)}║
║   Status:      ✅ Running                              ║
╚════════════════════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

module.exports = app;
