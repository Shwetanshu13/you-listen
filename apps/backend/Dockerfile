# Use full Node.js base (not Alpine) to simplify Python + yt-dlp install
FROM node:20

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy monorepo files
COPY . .

# Install dependencies for backend (and any workspaces it depends on)
RUN pnpm install --filter ./apps/backend...

# Install Python and yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    python3 -m venv /yt-venv && \
    /yt-venv/bin/pip install --upgrade pip && \
    /yt-venv/bin/pip install yt-dlp

# Build backend
WORKDIR /app/apps/backend
RUN pnpm build

# Expose backend port
EXPOSE 4000

# Start backend
CMD ["node", "dist/apps/backend/src/index.js"]
