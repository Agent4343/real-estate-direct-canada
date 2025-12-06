# Production-ready backend image
FROM node:18-alpine AS base

WORKDIR /app

# Install dependencies first (leverages Docker cache)
COPY package*.json ./
RUN npm install --production

# Copy backend source
COPY . .

# Expose API port
EXPOSE 3000

ENV NODE_ENV=production

CMD ["npm", "start"]
