# Stage 1: Builder
# Using full node:20 (Debian Bookworm) for maximum native module support
FROM node:20 AS builder

WORKDIR /app

# Copy the entire workspace
COPY . .

# IMPORTANT: The package-lock.json from Windows often conflicts with Linux native binaries.
# Deleting it here forces npm to perform a clean resolution for the current Linux environment.
# This is the most reliable fix for "lightningcss.linux-x64-gnu.node not found" errors.
RUN rm -f package-lock.json

# Install dependencies (including devDependencies like tailwindcss and cross-env)
RUN npm install

# Set environment variables for build time
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
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
ENV NEXT_PUBLIC_FIREBASE_VAPID_KEY=$NEXT_PUBLIC_FIREBASE_VAPID_KEY
ENV STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
ENV MONGO_URI=$MONGO_URI
ENV JWT_SECRET=$JWT_SECRET

# Set build optimization flags
ENV NODE_OPTIONS="--no-deprecation"
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Perform the actual production build
RUN npm run build --workspace=apps/web

# Stage 2: Runner
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Standard Debian/Slim commands for user management
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# 1. Copy standalone output from Next.js build
# Standalone contains the minimum node_modules and the built application
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone /app/
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static /app/apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public /app/apps/web/public

# 2. Explicitly copy administrative scripts and models
# We create the directory first to ensure the COPY command places files in the correct location
RUN mkdir -p /app/apps/web/src
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/src/scripts /app/apps/web/src/scripts
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/src/models /app/apps/web/src/models

# 3. Overwrite package.json files to ensure ESM support ("type": "module")
# We place it in both the root and apps/web to be absolutely sure Node.js identifies the ESM type
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json /app/package.json
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/package.json /app/apps/web/package.json

# Permissions for storage volume
RUN mkdir -p /app/storage && chown -R nextjs:nodejs /app/storage

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
