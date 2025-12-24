# Base image
FROM node:18-alpine
 
# Set working directory
WORKDIR /app
 
# Install pnpm globally
RUN npm install -g pnpm
 
# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./
 
# Clear pnpm cache and install dependencies with no cache
RUN pnpm store prune && pnpm install --frozen-lockfile --no-cache
 
# Copy the rest of the application code
COPY . .
 
# Build the Next.js application
RUN pnpm build
 
# Expose the port the app will run on
EXPOSE 3000
 
# Command to start the application
CMD ["pnpm", "start"]