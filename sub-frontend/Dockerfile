# Stage 1: The Build Stage
# Use a slim Node.js base image for building the app
FROM node:18-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy all the rest of your app's code
COPY . .

# Run the Next.js build command
RUN npm run build

# Stage 2: The Production Runner
# Use a new, clean, and slim Node.js image
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy only the essential files from the builder stage
# We're copying over the built code, node_modules, and package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy the public folder with your static assets (if any)
COPY --from=builder /app/public ./public

# Expose the port Next.js runs on. Default is 3000.
EXPOSE 3000

# The command to start the Next.js production server
CMD ["npm", "start"]