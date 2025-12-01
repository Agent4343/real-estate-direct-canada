# Real Estate Direct Platform

A comprehensive one-stop-shop platform for buying and selling real estate in Canada. Connect directly with buyers and sellers, compare mortgages from leading banks, and find qualified lawyers in your area - all without realtors.

## 🏠 Features

### Core Features
- **Direct Property Listings** - List and browse properties across all Canadian provinces
- **Buyer-Seller Direct Connection** - Communicate and transact without intermediaries
- **Mortgage Comparison** - Compare mortgage rates from leading Canadian banks
- **Lawyer Directory** - Find verified real estate lawyers by location
- **Provincial Compliance** - Built-in compliance with all provincial real estate regulations

### Provincial Support
Fully supports all 13 Canadian provinces and territories:
- British Columbia (BC) - BCFSA
- Alberta (AB) - RECA
- Saskatchewan (SK) - SCA
- Manitoba (MB) - MREA
- Ontario (ON) - RECO
- Quebec (QC) - OACIQ
- New Brunswick (NB) - APNB
- Nova Scotia (NS) - NSUARB
- Prince Edward Island (PE)
- Newfoundland and Labrador (NL)
- Yukon (YT)
- Northwest Territories (NT)
- Nunavut (NU)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd Real-Estate-Direct-master
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DB_CONNECTION` - MongoDB connection string
- `SECRET_KEY` - JWT secret key (change in production!)
- `PORT` - Server port (default: 3000)

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on your system
mongod
```

5. **Run the application**
```bash
npm start
# or for development with auto-reload
npm run dev
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### Properties
- `GET /api/properties` - List all properties (with filtering)
- `GET /api/properties/:id` - Get property details
- `POST /api/properties` - Create property listing (Protected)
- `PUT /api/properties/:id` - Update property (Protected)
- `DELETE /api/properties/:id` - Delete property (Protected)
- `GET /api/properties/province/:province` - Get properties by province

### Mortgages
- `GET /api/mortgages` - List all mortgages (with filtering)
- `GET /api/mortgages/best` - Get best mortgage offers
- `GET /api/mortgages/province/:province` - Get mortgages by province
- `GET /api/mortgages/:id` - Get mortgage details
- `POST /api/mortgages/:id/apply` - Record mortgage application interest

### Lawyers
- `GET /api/lawyers` - List all lawyers (with filtering)
- `GET /api/lawyers/nearby` - Find lawyers near location
- `GET /api/lawyers/province/:province` - Get lawyers by province
- `GET /api/lawyers/:id` - Get lawyer details
- `POST /api/lawyers/:id/inquire` - Send inquiry to lawyer
- `POST /api/lawyers/:id/review` - Add review to lawyer

### Transactions
- `POST /api/transactions/offer` - Make an offer on property
- `GET /api/transactions/my-offers` - Get user's offers
- `GET /api/transactions/my-listings` - Get offers on user's listings
- `GET /api/transactions/:id` - Get transaction details
- `PUT /api/transactions/:id/accept` - Accept offer (Seller)
- `PUT /api/transactions/:id/reject` - Reject offer (Seller)
- `PUT /api/transactions/:id/withdraw` - Withdraw offer (Buyer)

### Legal & Compliance
- `GET /api/legal/terms` - Get Terms of Service
- `GET /api/legal/privacy` - Get Privacy Policy
- `GET /api/legal/disclaimer` - Get Platform Disclaimers
- `GET /api/legal/provinces` - Get provincial regulations info
- `POST /api/legal/accept-terms` - Accept Terms of Service
- `POST /api/legal/accept-privacy` - Accept Privacy Policy
- `POST /api/legal/acknowledge-province` - Acknowledge province regulations

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on all API routes
- Helmet.js for security headers
- CORS protection
- Input validation with express-validator
- Provincial compliance checks

## 🏛️ Legal Compliance

### Built-in Compliance Features
- Provincial regulation acknowledgment system
- Mandatory disclosure tracking
- Cooling-off period enforcement
- Deposit requirement validation
- Terms of Service acceptance tracking
- Privacy Policy compliance (PIPEDA)

### Important Legal Notes
- **Platform Disclaimer**: This platform is a listing service, NOT a real estate brokerage
- **User Responsibility**: Users must comply with all provincial regulations
- **Professional Consultation**: Users must consult licensed lawyers and inspectors
- **No Warranties**: Property information is provided "as is"

## 📁 Project Structure

```
├── config/
│   └── provincialRegulations.js  # Provincial regulations configuration
├── middleware/
│   ├── auth.js                   # Authentication middleware
│   ├── compliance.js             # Compliance checking middleware
│   └── validation.js             # Input validation middleware
├── models/
│   ├── Property.model.js         # Property/Listing model
│   ├── Transaction.model.js      # Transaction model
│   ├── Mortgage.model.js         # Mortgage model
│   └── Lawyer.model.js           # Lawyer directory model
├── routes/
│   ├── auth.routes.js            # Authentication routes
│   ├── property.routes.js        # Property routes
│   ├── mortgage.routes.js        # Mortgage routes
│   ├── lawyer.routes.js          # Lawyer routes
│   ├── transaction.routes.js     # Transaction routes
│   └── legal.routes.js           # Legal documents routes
├── app.js                        # Main application file
├── user.model.js                 # User model
└── package.json                  # Dependencies
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, CORS, express-rate-limit
- **Validation**: express-validator, Joi
- **Password Hashing**: bcrypt

## 📝 Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `DB_CONNECTION` - MongoDB connection string
- `SECRET_KEY` - JWT secret (CHANGE IN PRODUCTION!)
- `PORT` - Server port
- `NODE_ENV` - Environment (development/production)

## 🧪 Testing

```bash
npm test
```

## 📋 TODO / Roadmap

### Completed ✅
- [x] Transaction workflow completion
- [x] File upload for property images
- [x] Document management system
- [x] Admin dashboard
- [x] Messaging system
- [x] Audit logging system
- [x] Payment routes (ready for Stripe integration)

### In Progress / Next Steps
- [ ] Payment integration (Stripe) - Routes ready, needs API keys
- [ ] Email notifications - Template ready, needs service provider (SendGrid/Mailgun)
- [ ] Advanced search and filtering - Basic search done, needs Elasticsearch
- [ ] Real-time messaging - Basic messaging done, needs WebSocket
- [ ] Frontend application (React/Next.js)
- [ ] Mobile app

## ⚠️ Important Notes

1. **Legal Consultation Required**: Before launching, consult with Canadian real estate lawyers familiar with all provinces
2. **Insurance**: Obtain appropriate liability insurance
3. **Regulatory Compliance**: Ensure compliance with all provincial regulatory bodies
4. **Security**: Change all default secrets in production
5. **Testing**: Thoroughly test all compliance features before launch

## 🤝 Contributing

This is a proprietary platform. For contributions, please contact the development team.

## 📄 License

Proprietary - All Rights Reserved

## 📞 Support

For questions or support:
- Email: support@realestatedirect.ca
- Legal: legal@realestatedirect.ca

## 🙏 Acknowledgments

Built with compliance in mind for the Canadian real estate market across all provinces and territories.

---

**⚠️ LEGAL DISCLAIMER**: This platform is provided as-is. Users are responsible for compliance with all applicable laws and regulations. Consult legal professionals before making real estate decisions.
