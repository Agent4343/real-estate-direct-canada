# 🚀 Quick Start Testing Guide

## 📋 Quick Test Checklist

### Step 1: Start Servers

**Backend:**
```powershell
npm start
# Or for development mode:
npm run dev
```

**Frontend (in new terminal):**
```powershell
cd frontend
npm run dev
```

---

### Step 2: Run Automated Backend Tests

```powershell
.\test-backend.ps1
```

This will test:
- ✅ Server health
- ✅ API documentation
- ✅ Public endpoints
- ✅ User registration
- ✅ User login
- ✅ Authentication

---

### Step 3: Manual Frontend Testing

1. **Open Browser:** http://localhost:3001

2. **Test Registration:**
   - Go to `/register`
   - Create a test account
   - Should redirect to dashboard

3. **Test Login:**
   - Logout if logged in
   - Go to `/login`
   - Login with test account
   - Should redirect to dashboard

4. **Test Property Listing:**
   - Go to `/properties`
   - Should show property listings
   - Use search filters

5. **Test Create Property:**
   - Go to `/properties/new`
   - Fill in property form
   - Submit
   - Should create and redirect

6. **Test Property Detail:**
   - Click on a property
   - Should show detail page
   - Test "Make Offer" button
   - Test "Add to Favorites" button

7. **Test Dashboard:**
   - Go to `/dashboard`
   - Test all tabs:
     - Overview
     - My Properties
     - My Offers
     - Incoming Offers
     - Favorites

8. **Test Other Pages:**
   - `/mortgages` - Should show mortgages
   - `/lawyers` - Should show lawyers
   - `/calculator` - Should calculate mortgage

---

### Step 4: Check for Errors

**Backend Console:**
- Watch for error messages
- Check for database connection issues
- Look for validation errors

**Frontend Console (Browser DevTools):**
- Press F12 to open
- Check Console tab for errors
- Check Network tab for failed requests

---

## 🐛 Common Issues & Fixes

### Issue: Backend won't start
**Check:**
- MongoDB is running
- `.env` file exists
- Port 3000 is not in use

### Issue: Frontend won't start
**Check:**
- Backend is running first
- Port 3001 is not in use
- Dependencies installed (`npm install` in frontend folder)

### Issue: 500 Error on Registration
**Check:**
- Backend console for error message
- SECRET_KEY is set in `.env`
- MongoDB connection is working

### Issue: CORS Error
**Check:**
- FRONTEND_URL is set in backend `.env`
- Backend CORS configuration

---

## 📝 Report Test Results

After testing, note:
- ✅ What worked
- ❌ What failed
- 🔍 Error messages
- 📸 Screenshots (if helpful)

---

**Ready to test?** Run the automated script first, then do manual testing!

