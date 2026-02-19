# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ build-base libstdc++ gcompat
WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
# Copy workspace package files
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat python3 make g++ build-base libstdc++ gcompat
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables for build time
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STORAGE_STRATEGY
ARG NEXT_PUBLIC_ENABLE_API_DEBUG
ARG NEXT_PUBLIC_ENABLE_NOTIFICATION_DEBUG
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_USE_MOCK_API
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ARG NEXT_PUBLIC_FIREBASE_VAPID_KEY
ARG STRIPE_SECRET_KEY
ARG MONGO_URI
ARG JWT_SECRET

# Set environment variables from build args
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_STORAGE_STRATEGY=$NEXT_PUBLIC_STORAGE_STRATEGY
ENV NEXT_PUBLIC_ENABLE_API_DEBUG=$NEXT_PUBLIC_ENABLE_API_DEBUG
ENV NEXT_PUBLIC_ENABLE_NOTIFICATION_DEBUG=$NEXT_PUBLIC_ENABLE_NOTIFICATION_DEBUG
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_USE_MOCK_API=$NEXT_PUBLIC_USE_MOCK_API
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV NEXT_PUBLIC_FIREBASE_VAPID_KEY=$NEXT_PUBLIC_FIREBASE_VAPID_KEY
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV MONGO_URI=$MONGO_URI
ENV JWT_SECRET=$JWT_SECRET

# Set environment to production for build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the specific workspace
RUN npm run build --workspace=apps/web

# Stage 3: Runner
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat libstdc++ gcompat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json

# Copy built application
# standalone output in monorepos is relative to the root
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# Create storage directory with proper permissions
RUN mkdir -p /app/storage && chown -R nextjs:nodejs /app/storage

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
