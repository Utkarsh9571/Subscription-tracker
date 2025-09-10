# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first (for better caching)
COPY package.json package-lock.json ./

# Install all dependencies (including dev) for build
RUN npm ci

# Copy the rest of the application code
COPY . .

# If you have a .env.production file, copy it so build can use NEXT_PUBLIC_* vars
# COPY .env.production ./

# Build the Next.js app
RUN npm run build

# ---------- Stage 2: Production Runner ----------
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install only production dependencies
RUN npm ci --only=production

# Copy built output and public assets
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the port Next.js will run on
EXPOSE 3000

# Set NODE_ENV to production
ENV NODE_ENV=production

# Start the Next.js production server
CMD ["npm", "start"]
