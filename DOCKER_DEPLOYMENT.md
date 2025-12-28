# 🚢 Docker Deployment Guide

## Prerequisites
- Docker 24+ and Docker Compose v2
- `.env` file (optional) with production secrets
- Open ports `3000` (API) and `27017` (Mongo) on your host machine

## 1. Build and Run Backend Only
```bash
# Build the image
docker build -t real-estate-backend .

# Run it (requires external Mongo URI)
docker run -d --name real-estate-backend \
  -e PORT=3000 \
  -e NODE_ENV=production \
  -e SECRET_KEY=super-secret-change-me \
  -e DB_CONNECTION=mongodb+srv://<user>:<pass>@cluster.mongodb.net/real-estate-direct \
  -e FRONTEND_URL=https://your-frontend-domain \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  real-estate-backend
```

## 2. Full Stack (Backend + Mongo) via Compose
```bash
# Starts Mongo + backend API with hot-reload volume for uploads
docker compose up -d --build
```
- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs
- Mongo shell: `docker exec -it <compose_prefix>-mongo-1 mongosh`

## 3. Environment Variables
| Variable | Description |
| --- | --- |
| `PORT` | Express port (default `3000`) |
| `NODE_ENV` | Environment label (`production` or `development`) |
| `SECRET_KEY` | JWT signing secret (required) |
| `DB_CONNECTION` | Mongo URI. In compose defaults to `mongodb://mongo:27017/real-estate-direct` |
| `FRONTEND_URL` | Allowed CORS origin (e.g., Vercel domain) |
| Other service-specific keys | (SMTP, Stripe, DocuSign) add as needed |

## 4. Common Commands
```bash
# View logs
docker compose logs -f backend

# Restart services
docker compose restart backend

# Stop and remove containers
docker compose down

# Clean volumes (removes Mongo data)
docker compose down -v
```

## 5. Production Notes
- Replace the sample `SECRET_KEY` and Mongo URI with secure values before deployment.
- Mount `uploads/` to persistent storage or switch to S3/Cloud Storage for production assets.
- Configure backups for `mongo-data` volume if you keep Mongo inside Compose.
- For managed MongoDB (Atlas), remove the `mongo` service and point `DB_CONNECTION` to the hosted cluster.
- Consider multi-stage Docker builds (install dev deps separately) if you add build steps.

With Docker + Compose, you can spin up a fully local stack in under a minute and mirror production as closely as needed.🚀
