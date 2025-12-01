# 🚀 Quick Start - Real Estate Direct Platform

## Server is Starting/Running!

### 🌐 Access Your API

**API Documentation (Swagger UI):**
```
http://localhost:3000/api-docs
```
👉 **Open this in your browser to explore all API endpoints!**

**API Root:**
```
http://localhost:3000/
```

**Health Check:**
```
http://localhost:3000/health
```

---

## 📋 Quick Commands

### Start the Server
```bash
npm start
```

### Start with Auto-reload (Development)
```bash
npm run dev
```

### Check if Server is Running
```powershell
netstat -ano | findstr :3000
```

### Test Server
```powershell
Invoke-WebRequest -Uri http://localhost:3000/health -UseBasicParsing
```

---

## 🎯 First Steps

1. **Open API Documentation**
   - Visit: http://localhost:3000/api-docs
   - Explore all available endpoints
   - Test endpoints directly in Swagger UI

2. **Test the API**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Get API info
   curl http://localhost:3000/
   ```

3. **Register a Test User**
   - Use Swagger UI at `/api-docs`
   - Go to `/api/auth/register`
   - Click "Try it out"
   - Enter test data and execute

---

## ✅ Server Status

- **Port:** 3000
- **MongoDB:** Required (should be running)
- **Environment:** Development
- **Status:** Starting/Running

---

## 🔧 Troubleshooting

### Server Won't Start
1. Check MongoDB is running:
   ```powershell
   Get-Service | Where-Object {$_.Name -like "*mongo*"}
   ```

2. Check port 3000 is available:
   ```powershell
   netstat -ano | findstr :3000
   ```

3. Check .env file exists and has correct values

### MongoDB Connection Error
- Ensure MongoDB service is running
- Check connection string in .env file
- Default: `mongodb://localhost:27017/real-estate-direct`

---

## 📚 Available Endpoints

**70+ API Endpoints** including:
- Authentication (register, login)
- Properties (CRUD, search, images)
- Transactions (offers, accept, reject)
- Mortgages (comparison, filtering)
- Lawyers (directory, search)
- Documents (upload, templates)
- Admin (dashboard, management)
- And many more!

**See full list at:** http://localhost:3000/api-docs

---

**🎉 Your server should be running now!**

Open http://localhost:3000/api-docs in your browser to get started!

