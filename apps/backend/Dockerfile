# Base image with Node and Python
FROM node:20-slim

# Set working dir
WORKDIR /app

# Install Python + yt-dlp via venv
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    python3 -m venv /yt-venv && \
    /yt-venv/bin/pip install --upgrade pip && \
    /yt-venv/bin/pip install yt-dlp

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
