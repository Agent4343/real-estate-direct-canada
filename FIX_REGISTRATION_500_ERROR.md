# 🔧 Fixing 500 Error on Registration

## Problem
Registration endpoint returns 500 Internal Server Error.

## Common Causes

1. **Missing SECRET_KEY** in `.env` file
2. **MongoDB connection issue**
3. **Validation middleware error**
4. **Missing required fields**

## ✅ Solutions

### 1. Check Environment Variables
Make sure `.env` file exists with:
```
SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
DB_CONNECTION=mongodb://localhost:27017/real-estate-direct
PORT=3000
NODE_ENV=development
```

### 2. Check MongoDB Connection
- Make sure MongoDB is running
- Verify connection string is correct

### 3. Check Backend Logs
Look at the backend PowerShell window for error messages. Common errors:
- "SECRET_KEY is required"
- "Cannot connect to MongoDB"
- "Validation error"

## 🔍 Debugging Steps

1. Check backend console for the actual error message
2. Verify `.env` file exists and has SECRET_KEY
3. Test MongoDB connection
4. Check if validation middleware is working

---

**Check the backend PowerShell window for the specific error!**

