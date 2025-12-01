# 🧪 Comprehensive Testing Guide

## 🎯 Testing Strategy

This guide will help you systematically test all features of the Real Estate Direct platform.

---

## 📋 Pre-Testing Checklist

### Before You Start:
- [ ] Backend server is running (port 3000)
- [ ] Frontend server is running (port 3001)
- [ ] MongoDB is running and connected
- [ ] `.env` file is configured
- [ ] Have test user credentials ready

---

## 🚀 Test Plan

### Phase 1: Basic Functionality ✅

#### 1.1 Backend Health Check
**Endpoint:** `GET http://localhost:3000/health`

**Expected:**
- Status 200
- Server is running message

**Test:**
```bash
curl http://localhost:3000/health
```

---

#### 1.2 API Documentation Access
**URL:** http://localhost:3000/api-docs

**Expected:**
- Swagger UI loads
- All endpoints visible
- Can browse API documentation

---

#### 1.3 Frontend Access
**URL:** http://localhost:3001

**Expected:**
- Homepage loads
- No console errors
- Navigation works

---

### Phase 2: Authentication 🔐

#### 2.1 User Registration
**Endpoint:** `POST /api/auth/register`

**Test Data:**
```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "test@example.com",
  "password": "Test1234",
  "province": "ON",
  "role": "Buyer"
}
```

**Expected:**
- Status 201
- JWT token returned
- User created in database

**Frontend Test:**
1. Go to http://localhost:3001/register
2. Fill in form
3. Submit
4. Should redirect to dashboard

---

#### 2.2 User Login
**Endpoint:** `POST /api/auth/login`

**Test Data:**
```json
{
  "email": "test@example.com",
  "password": "Test1234"
}
```

**Expected:**
- Status 200
- JWT token returned
- User data returned

**Frontend Test:**
1. Go to http://localhost:3001/login
2. Enter credentials
3. Submit
4. Should redirect to dashboard

---

#### 2.3 Get Current User
**Endpoint:** `GET /api/auth/me`
**Headers:** `Authorization: Bearer <token>`

**Expected:**
- Status 200
- Current user data returned

---

### Phase 3: Properties 🏠

#### 3.1 List All Properties
**Endpoint:** `GET /api/properties`

**Expected:**
- Status 200
- Array of properties returned
- Can filter by parameters

**Frontend Test:**
1. Go to http://localhost:3001/properties
2. Properties should load
3. Search filters should work

---

#### 3.2 Create Property Listing
**Endpoint:** `POST /api/properties`
**Headers:** `Authorization: Bearer <token>`

**Test Data:**
```json
{
  "title": "Beautiful House in Toronto",
  "description": "A lovely 3-bedroom house",
  "address": {
    "street": "123 Main St",
    "city": "Toronto",
    "province": "ON",
    "postalCode": "M1A 1A1"
  },
  "price": 500000,
  "propertyType": "House",
  "bedrooms": 3,
  "bathrooms": 2,
  "squareFootage": 1500,
  "listingType": "Sale",
  "province": "ON"
}
```

**Expected:**
- Status 201
- Property created
- Property ID returned

**Frontend Test:**
1. Go to http://localhost:3001/properties/new
2. Fill in property form
3. Submit
4. Should create property and redirect

---

#### 3.3 Get Property Details
**Endpoint:** `GET /api/properties/:id`

**Expected:**
- Status 200
- Full property details returned

**Frontend Test:**
1. Click on a property
2. Should show property detail page
3. All details should display

---

#### 3.4 Update Property
**Endpoint:** `PUT /api/properties/:id`
**Headers:** `Authorization: Bearer <token>`

**Expected:**
- Status 200
- Property updated
- Changes reflected

---

#### 3.5 Delete Property
**Endpoint:** `DELETE /api/properties/:id`
**Headers:** `Authorization: Bearer <token>`

**Expected:**
- Status 200
- Property deleted

---

### Phase 4: Transactions 💰

#### 4.1 Make an Offer
**Endpoint:** `POST /api/transactions/offer`
**Headers:** `Authorization: Bearer <token>`

**Test Data:**
```json
{
  "propertyId": "<property_id>",
  "offerPrice": 480000,
  "depositAmount": 10000,
  "conditions": "Subject to inspection",
  "financingPreApproved": true
}
```

**Expected:**
- Status 201
- Transaction created
- Status: "Pending"
- Notifications sent

**Frontend Test:**
1. Go to property detail page
2. Click "Make an Offer"
3. Fill in offer form
4. Submit
5. Offer should be created

---

#### 4.2 Get My Offers
**Endpoint:** `GET /api/transactions/my-offers`
**Headers:** `Authorization: Bearer <token>`

**Expected:**
- Status 200
- List of user's offers

**Frontend Test:**
1. Go to dashboard
2. Click "My Offers" tab
3. Should show all offers

---

#### 4.3 Accept Offer
**Endpoint:** `PUT /api/transactions/:id/accept`
**Headers:** `Authorization: Bearer <token>`

**Expected:**
- Status 200
- Transaction status: "Accepted"
- Platform fees calculated
- Notifications sent

**Frontend Test:**
1. Go to dashboard
2. Click "Incoming Offers" tab
3. Click "Accept" on an offer
4. Should accept and update status

---

#### 4.4 Reject Offer
**Endpoint:** `PUT /api/transactions/:id/reject`
**Headers:** `Authorization: Bearer <token>`

**Expected:**
- Status 200
- Transaction status: "Rejected"
- Notification sent

**Frontend Test:**
1. Go to dashboard
2. Click "Incoming Offers" tab
3. Click "Reject" on an offer
4. Should reject and update status

---

### Phase 5: Favorites ❤️

#### 5.1 Add to Favorites
**Endpoint:** `POST /api/favorites`
**Headers:** `Authorization: Bearer <token>`

**Test Data:**
```json
{
  "propertyId": "<property_id>"
}
```

**Expected:**
- Status 201
- Property added to favorites

**Frontend Test:**
1. Go to property detail page
2. Click "Add to Favorites"
3. Heart icon should fill

---

#### 5.2 Get Favorites
**Endpoint:** `GET /api/favorites`
**Headers:** `Authorization: Bearer <token>`

**Expected:**
- Status 200
- List of favorited properties

**Frontend Test:**
1. Go to dashboard
2. Click "Favorites" tab
3. Should show favorited properties

---

#### 5.3 Remove from Favorites
**Endpoint:** `DELETE /api/favorites/:id`
**Headers:** `Authorization: Bearer <token>`

**Expected:**
- Status 200
- Property removed from favorites

---

### Phase 6: Mortgages 💳

#### 6.1 Get Mortgages by Province
**Endpoint:** `GET /api/mortgages/province/:province`

**Expected:**
- Status 200
- List of mortgages for province

**Frontend Test:**
1. Go to http://localhost:3001/mortgages
2. Select province
3. Should show mortgages

---

#### 6.2 Get Best Mortgages
**Endpoint:** `GET /api/mortgages/best/:province`

**Expected:**
- Status 200
- Best mortgage options

---

### Phase 7: Lawyers ⚖️

#### 7.1 Get Lawyers by Province
**Endpoint:** `GET /api/lawyers/province/:province`

**Expected:**
- Status 200
- List of lawyers for province

**Frontend Test:**
1. Go to http://localhost:3001/lawyers
2. Select province
3. Should show lawyers

---

### Phase 8: Mortgage Calculator 🧮

#### 8.1 Calculate Payment
**Endpoint:** `POST /api/mortgage-calculator/payment`

**Test Data:**
```json
{
  "principal": 400000,
  "interestRate": 5.5,
  "term": 5,
  "amortizationPeriod": 25
}
```

**Expected:**
- Status 200
- Monthly payment calculated
- Total interest calculated

**Frontend Test:**
1. Go to http://localhost:3001/calculator
2. Enter mortgage details
3. Click calculate
4. Should show results

---

### Phase 9: Dashboard 📊

#### 9.1 Dashboard Access
**URL:** http://localhost:3001/dashboard

**Expected:**
- Dashboard loads
- User stats displayed
- Tabs work (Overview, Properties, Offers, Favorites)

---

#### 9.2 Dashboard Tabs
**Test Each Tab:**
- [ ] Overview tab shows stats
- [ ] My Properties tab shows user's properties
- [ ] My Offers tab shows offers made
- [ ] Incoming Offers tab shows offers received
- [ ] Favorites tab shows favorited properties

---

### Phase 10: Error Handling ⚠️

#### 10.1 Invalid Authentication
**Test:**
- Access protected endpoint without token
- Expected: 401 Unauthorized

#### 10.2 Invalid Input
**Test:**
- Submit form with missing required fields
- Expected: 400 Bad Request with error message

#### 10.3 Not Found
**Test:**
- Access non-existent property
- Expected: 404 Not Found

---

## 🐛 Common Issues to Check

### Backend Issues:
- [ ] MongoDB connection errors
- [ ] Missing environment variables
- [ ] JWT token expiration
- [ ] File upload errors
- [ ] CORS errors

### Frontend Issues:
- [ ] Console errors
- [ ] Hydration errors
- [ ] API connection refused
- [ ] Missing images
- [ ] Form validation errors

---

## 📊 Test Results Template

```
Date: _______________
Tester: _______________

Phase 1: Basic Functionality
- [ ] Backend Health Check: PASS / FAIL
- [ ] API Docs: PASS / FAIL
- [ ] Frontend Access: PASS / FAIL

Phase 2: Authentication
- [ ] Registration: PASS / FAIL
- [ ] Login: PASS / FAIL
- [ ] Get Current User: PASS / FAIL

Phase 3: Properties
- [ ] List Properties: PASS / FAIL
- [ ] Create Property: PASS / FAIL
- [ ] Get Property Details: PASS / FAIL
- [ ] Update Property: PASS / FAIL
- [ ] Delete Property: PASS / FAIL

Phase 4: Transactions
- [ ] Make Offer: PASS / FAIL
- [ ] Get My Offers: PASS / FAIL
- [ ] Accept Offer: PASS / FAIL
- [ ] Reject Offer: PASS / FAIL

Phase 5: Favorites
- [ ] Add to Favorites: PASS / FAIL
- [ ] Get Favorites: PASS / FAIL
- [ ] Remove from Favorites: PASS / FAIL

Phase 6: Mortgages
- [ ] Get Mortgages: PASS / FAIL
- [ ] Get Best Mortgages: PASS / FAIL

Phase 7: Lawyers
- [ ] Get Lawyers: PASS / FAIL

Phase 8: Calculator
- [ ] Calculate Payment: PASS / FAIL

Phase 9: Dashboard
- [ ] Dashboard Access: PASS / FAIL
- [ ] Dashboard Tabs: PASS / FAIL

Phase 10: Error Handling
- [ ] Invalid Auth: PASS / FAIL
- [ ] Invalid Input: PASS / FAIL
- [ ] Not Found: PASS / FAIL
```

---

## 🚨 Known Issues to Watch For

1. **Registration 500 Error**
   - Check backend console for error
   - Verify SECRET_KEY is set
   - Check MongoDB connection

2. **Hydration Warnings**
   - Browser extension related
   - Harmless but can be suppressed

3. **Image Upload Errors**
   - Check uploads directory exists
   - Verify file permissions

4. **CORS Errors**
   - Check FRONTEND_URL in .env
   - Verify CORS configuration

---

## ✅ Testing Best Practices

1. **Test as Different Users:**
   - Buyer account
   - Seller account
   - Admin account (if available)

2. **Test Edge Cases:**
   - Empty fields
   - Very long inputs
   - Special characters
   - Large numbers

3. **Test on Different Browsers:**
   - Chrome
   - Firefox
   - Edge

4. **Test Mobile Responsiveness:**
   - Resize browser
   - Test on mobile device

---

## 📝 Reporting Issues

When reporting issues, include:
- What you were trying to do
- What happened vs. what you expected
- Error messages (if any)
- Browser console errors
- Backend console errors
- Steps to reproduce

---

**Happy Testing!** 🚀

