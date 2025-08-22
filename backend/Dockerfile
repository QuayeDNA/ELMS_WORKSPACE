# ELMS Backend Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 elms

# Create directories for logs and uploads
RUN mkdir -p logs uploads temp
RUN chown -R elms:nodejs logs uploads temp

COPY --from=builder --chown=elms:nodejs /app/dist ./dist
COPY --from=builder --chown=elms:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=elms:nodejs /app/package.json ./package.json
COPY --from=builder --chown=elms:nodejs /app/prisma ./prisma

USER elms

EXPOSE 3000

ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "dist/server.js"]
