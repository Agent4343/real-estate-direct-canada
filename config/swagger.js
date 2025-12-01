const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Direct API',
      version: '1.0.0',
      description: 'Comprehensive API for buying and selling real estate in Canada. One-stop-shop platform with mortgage comparison, lawyer directory, and full provincial compliance.',
      contact: {
        name: 'API Support',
        email: 'support@realestatedirect.ca'
      },
      license: {
        name: 'Proprietary',
        url: 'https://realestatedirect.ca/license'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.realestatedirect.ca',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['Buyer', 'Seller', 'Admin'] },
            province: { type: 'string' },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Property: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            province: { type: 'string' },
            city: { type: 'string' },
            price: { type: 'number' },
            propertyType: { type: 'string' },
            bedrooms: { type: 'number' },
            bathrooms: { type: 'number' },
            status: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            buyerId: { type: 'string' },
            sellerId: { type: 'string' },
            propertyId: { type: 'string' },
            status: { type: 'string' },
            offerPrice: { type: 'number' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication and authorization' },
      { name: 'Properties', description: 'Property listings and management' },
      { name: 'Transactions', description: 'Buying/selling transaction workflow' },
      { name: 'Mortgages', description: 'Mortgage comparison and offers' },
      { name: 'Lawyers', description: 'Lawyer directory and matching' },
      { name: 'Documents', description: 'Document management and submissions' },
      { name: 'Legal', description: 'Legal documents and compliance' },
      { name: 'Admin', description: 'Admin dashboard and management' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Favorites', description: 'Favorite properties' },
      { name: 'Saved Searches', description: 'Saved property searches' },
      { name: 'Reviews', description: 'Property reviews and ratings' },
      { name: 'Messaging', description: 'Buyer-seller messaging' },
      { name: 'Payments', description: 'Payment processing and fees' }
    ]
  },
  apis: [
    './routes/*.js',
    './app.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

