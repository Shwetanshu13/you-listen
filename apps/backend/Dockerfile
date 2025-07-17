# Base image with Node and Python
FROM node:20-slim

# Set working dir
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy everything
COPY . .

# Install dependencies (entire monorepo)
RUN pnpm install

# Build backend
RUN pnpm build

# Expose port
EXPOSE 4000

# # Start backend
CMD ["pnpm", "start"]
