# Starting the Real Estate Direct Platform Server

## ✅ Server is Ready!

The server has been configured and is ready to run.

## 🚀 Quick Start

### Option 1: Start in Foreground (Recommended for Development)
```bash
npm start
```

### Option 2: Start with Auto-reload (Development)
```bash
npm run dev
```

### Option 3: Start in Background (Windows PowerShell)
```powershell
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm start"
```

## 📋 Prerequisites

### ✅ Completed
- ✅ Node.js installed (v20.15.0)
- ✅ npm installed (v10.9.0)
- ✅ Dependencies installed
- ✅ MongoDB service running
- ✅ .env file created

### Required Environment Variables (Already Set)
- `PORT=3000`
- `DB_CONNECTION=mongodb://localhost:27017/real-estate-direct`
- `SECRET_KEY=real-estate-direct-super-secret-jwt-key-change-in-production-2024`
- `NODE_ENV=development`

## 🌐 Access the API

Once the server starts, you can access:

- **API Root:** http://localhost:3000/
- **API Documentation (Swagger):** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health

## 📝 Expected Server Output

When the server starts successfully, you should see:

```
✅ Connected to MongoDB database

╔════════════════════════════════════════════════════════╗
║   Real Estate Direct Platform - API Server             ║
╠════════════════════════════════════════════════════════╣
║   Environment: development                             ║
║   Server running on: http://localhost:3000             ║
║   API Documentation: http://localhost:3000/api-docs    ║
╚════════════════════════════════════════════════════════╝
```

## 🔍 Troubleshooting

### If MongoDB Connection Fails
1. Check if MongoDB service is running:
   ```powershell
   Get-Service | Where-Object {$_.Name -like "*mongo*"}
   ```

2. Start MongoDB service if needed:
   ```powershell
   Start-Service MongoDB
   ```

3. Or use MongoDB Compass to verify connection

### If Port 3000 is Already in Use
Change the port in `.env` file:
```
PORT=3001
```

### Check Server Logs
Look for error messages in the console output. Common issues:
- MongoDB connection errors
- Missing dependencies
- Port conflicts

## ✅ Verification

Test the server is running:

```powershell
# Check if server is listening
netstat -ano | findstr :3000

# Test API endpoint
Invoke-WebRequest -Uri http://localhost:3000/ -UseBasicParsing
```

## 📚 Next Steps

1. **Access API Documentation:**
   - Open browser: http://localhost:3000/api-docs
   - Explore all available endpoints

2. **Test API Endpoints:**
   - Register a user: `POST /api/auth/register`
   - List properties: `GET /api/properties`
   - View health: `GET /health`

3. **Start Development:**
   - Build frontend application
   - Integrate with API endpoints
   - Test all features

## 🎉 Success!

Your Real Estate Direct Platform backend is ready to use!

---

**Note:** The server needs MongoDB to be running. If MongoDB is not available, the server will exit with an error message.

