# 🔄 Backend Server Restart Instructions

## ✅ User Model Fixed!

The User model file has been recreated. Now you need to restart the backend server to load the fixed model.

## 🚀 How to Restart

### Option 1: If Server is Already Running

1. **Find the PowerShell window running the backend**
   - Look for a window showing "Real Estate Direct Platform - API Server"
   - Or check for "npm start" or "node app.js" in the title

2. **Stop the server:**
   - Press `Ctrl+C` in that window
   - Wait for it to stop

3. **Start it again:**
   ```bash
   npm start
   ```

### Option 2: Start Fresh

1. **Open a new PowerShell window**

2. **Navigate to project directory:**
   ```powershell
   cd C:\Users\mathe\Downloads\Real-Estate-Direct-master\Real-Estate-Direct-master
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Wait for success message:**
   ```
   ✅ Connected to MongoDB database
   Server running on: http://localhost:3000
   ```

## ✅ Verify Server is Running

Test that the server started correctly:

```powershell
# Test backend health
Invoke-RestMethod -Uri "http://localhost:3000/" -Method Get
```

Or run the test script:
```powershell
.\test-new-features.ps1
```

## 🧪 After Restart - Test User Registration

Once the server is running, test that the User model fix worked:

1. **Run test script:**
   ```powershell
   .\test-new-features.ps1
   ```

2. **Or test manually:**
   ```powershell
   $body = @{
       firstName = "Test"
       lastName = "User"
       email = "test@example.com"
       password = "TestPassword123"
       province = "ON"
       role = "Buyer"
   } | ConvertTo-Json
   
   Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -ContentType "application/json" -Body $body
   ```

## ⚠️ Important Notes

- **The server must be restarted** for the User model fix to take effect
- Node.js caches modules - restarting clears the cache
- If you see "User.findOne is not a function" errors, the server needs a restart

## ✅ Expected Result

After restarting:
- ✅ User registration should work
- ✅ Login should work  
- ✅ All authentication features functional
- ✅ Test script should pass all tests

---

**Once the server is restarted, the User model fix will be active!**

