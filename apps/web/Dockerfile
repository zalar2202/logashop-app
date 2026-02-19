# Stage 1: Builder
# Using full node:20 (Debian Bookworm) which includes necessary build tools and glibc
FROM node:20 AS builder

WORKDIR /app

# Set environment to development temporarily to ensure ALL dependencies (including devDeps) are installed
# Next.js 16, Tailwind v4, and PostCSS are in devDependencies and ARE REQUIRED for the build.
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Copy all files
COPY . .

# 1. Install EVERYTHING (including devDependencies like cross-env, tailwindcss, etc.)
RUN npm install

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

# Set NODE_OPTIONS globally to avoid needing cross-env for this specific flag
ENV NODE_OPTIONS="--no-deprecation"

# 2. Trigger a build to let Next.js patch the lockfile with missing linux dependencies
# We use || true because it's expected to fail due to missing native binaries initially
RUN npm run build --workspace=apps/web || true

# 3. Re-install to catch the patched dependencies (like @next/swc-linux-x64-gnu and lightningcss)
RUN npm install

# 4. Final production build
# Switch to production environment for the actual build process
ENV NODE_ENV=production
RUN npm run build --workspace=apps/web

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/src/scripts ./apps/web/src/scripts
COPY --from=builder /app/apps/web/src/models ./apps/web/src/models

# Standalone output in monorepos is relative to the root
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

RUN mkdir -p /app/storage && chown -R nextjs:nodejs /app/storage

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
