# 🚀 Vercel Deployment Guide

## ✅ Configuration Applied

Created `vercel.json` to properly configure Vercel for this monorepo structure.

## 📋 Configuration

- **Root Directory**: `frontend` (Next.js application)
- **Framework**: Next.js
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/.next`

## 🔧 Files Created

1. **vercel.json** - Main Vercel configuration
2. **vercelignore** - Files to ignore during build (Python files, backend files)

## 🚀 Deployment Steps

### Option 1: Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `Agent4343/real-estate-direct-canada`
3. **Important Settings:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend` (set this manually)
   - **Build Command**: `npm run build` (Vercel will detect this)
   - **Output Directory**: `.next`

4. Click "Deploy"

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set root directory: frontend
# - Framework: Next.js
```

## ⚙️ Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

## 🔍 Troubleshooting

### Issue: Still detecting Python/Flask

**Solution**: The `vercelignore` file should prevent this. If it persists:
1. Delete `requirements.txt` and `setup.py` from root (or move to ignored folder)
2. Ensure `vercel.json` has `rootDirectory: "frontend"`

### Issue: Build fails

**Check**:
- Ensure `frontend/package.json` has correct build script
- Check Node.js version (should be 14+)
- Verify all dependencies are in `frontend/package.json`

### Issue: API calls failing

**Solution**: 
- Set `NEXT_PUBLIC_API_URL` environment variable in Vercel
- Update `frontend/lib/api.js` to use the environment variable

## 📝 Notes

- **Backend**: The Express backend (`app.js`) is NOT deployed to Vercel. You'll need to deploy it separately (e.g., Railway, Render, Heroku, or your own server).
- **Frontend Only**: This Vercel setup deploys only the Next.js frontend.
- **API URL**: Make sure your frontend points to your deployed backend API.

---

**Ready to deploy! The configuration is now correct for Next.js on Vercel.**

