# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy monorepo
COPY . .

# Install backend deps
RUN pnpm install --filter backend...

# Install yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    python3 -m venv /yt-venv && \
    /yt-venv/bin/pip install --upgrade pip && \
    /yt-venv/bin/pip install yt-dlp

# Build backend
RUN pnpm --filter backend build

# Expose port
EXPOSE 4000

# Start backend
CMD ["pnpm", "--filter", "backend", "dev"]
