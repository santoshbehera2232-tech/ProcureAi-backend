# Multi-stage production Dockerfile for ProcureAI Enterprise Backend
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000

# Install dependencies first for efficient caching
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY src ./src

# Expose backend port
EXPOSE 5000

# Start server
CMD ["node", "src/server.js"]
