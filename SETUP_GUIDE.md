# Setup Guide - Real Estate Direct Platform

## Quick Start Checklist

### ✅ Completed Features

1. **Data Models**
   - ✅ Enhanced Property model with province, location, compliance fields
   - ✅ Enhanced User model with roles, verification, compliance tracking
   - ✅ Transaction model for buying/selling workflow
   - ✅ Mortgage model for bank comparison
   - ✅ Lawyer model for directory

2. **Provincial Compliance**
   - ✅ All 13 provinces/territories configured
   - ✅ Regulatory body information
   - ✅ Disclosure requirements
   - ✅ Cooling-off periods
   - ✅ Deposit requirements

3. **API Routes**
   - ✅ Authentication (register, login)
   - ✅ Properties (CRUD with filtering)
   - ✅ Mortgages (listing, comparison)
   - ✅ Lawyers (directory, search)
   - ✅ Transactions (offers, accept/reject)
   - ✅ Legal documents (ToS, Privacy, disclaimers)

4. **Security & Compliance**
   - ✅ JWT authentication
   - ✅ Password hashing
   - ✅ Rate limiting
   - ✅ Input validation
   - ✅ Compliance middleware
   - ✅ Provincial regulation checks

## 🔧 Setup Instructions

### Step 1: Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and set:
   - `DB_CONNECTION` - Your MongoDB connection string
   - `SECRET_KEY` - A strong random string (32+ characters)
   - `PORT` - Server port (default: 3000)

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start MongoDB

Make sure MongoDB is running:
```bash
# Linux/Mac
sudo systemctl start mongod
# or
mongod

# Windows
net start MongoDB
```

### Step 4: Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## 📋 Next Steps to Complete

### High Priority

1. **Remove/Update Old Files**
   - ⚠️ `auth.js` (old) - Replaced by `routes/auth.routes.js`
   - ⚠️ `item.routes.js` (old) - Replaced by `routes/property.routes.js`
   - ⚠️ `item.model.js` (old) - Replaced by `models/Property.model.js`

2. **Update package.json Scripts**
   - Add `dev` script for nodemon
   - Add `test` script

3. **Add Missing Dependencies**
   - Ensure all packages in package.json are installed

### Medium Priority

4. **File Upload System**
   - Configure multer for property images
   - Set up image storage
   - Add image upload endpoint

5. **Email Notifications**
   - Set up email service (SendGrid, etc.)
   - Add notification system for:
     - New offers
     - Accepted/rejected offers
     - Transaction updates

6. **Complete Transaction Workflow**
   - Payment processing (Stripe integration)
   - Document signing
   - Status tracking

### Legal & Compliance

7. **Legal Review**
   - ⚠️ Have lawyer review Terms of Service
   - ⚠️ Have lawyer review Privacy Policy
   - ⚠️ Verify provincial regulations accuracy
   - ⚠️ Obtain legal insurance

8. **Security Audit**
   - Review all security measures
   - Penetration testing
   - Data encryption audit

## 🧪 Testing the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "province": "ON"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### 4. Get Properties
```bash
curl http://localhost:3000/api/properties?province=ON
```

### 5. Get Mortgages
```bash
curl http://localhost:3000/api/mortgages/province/ON
```

### 6. Get Lawyers
```bash
curl http://localhost:3000/api/lawyers/province/ON
```

## 📊 Database Indexes

The models include indexes for:
- Province + City searches
- Property status filtering
- User email lookup
- Transaction status queries
- Geographic searches (for lawyers)

## 🔐 Security Checklist

- [x] Password hashing (bcrypt)
- [x] JWT authentication
- [x] Rate limiting
- [x] Input validation
- [x] Security headers (Helmet)
- [x] CORS configuration
- [ ] HTTPS in production
- [ ] Environment variable protection
- [ ] SQL injection prevention (using Mongoose)
- [ ] XSS protection
- [ ] CSRF protection (if using sessions)

## 🚨 Critical Warnings

1. **SECRET_KEY**: Must be changed in production
2. **Database**: Use strong MongoDB credentials
3. **HTTPS**: Required in production
4. **Legal Review**: Mandatory before launch
5. **Insurance**: Required before launch
6. **Testing**: Complete testing before launch

## 📞 Support

For setup issues, check:
1. MongoDB is running
2. Environment variables are set
3. Port 3000 is available
4. Dependencies are installed

## 🎯 Production Deployment Checklist

- [ ] Change all default secrets
- [ ] Set NODE_ENV=production
- [ ] Configure production MongoDB
- [ ] Set up HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up logging service
- [ ] Configure error monitoring
- [ ] Set up backup system
- [ ] Legal review completed
- [ ] Insurance obtained
- [ ] Security audit completed

---

**Remember**: This is a complex legal platform. Professional legal and security review is mandatory before launch.

