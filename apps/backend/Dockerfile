# Dockerfile

# --- Base Node Image ---
FROM node:20

# --- Set working directory ---
WORKDIR /app

# --- Install pnpm globally ---
RUN npm install -g pnpm

# --- Copy all files (monorepo) ---
COPY . .

# --- Install only backend and shared packages ---
RUN pnpm install --filter ./apps/backend...

# --- Install Python + yt-dlp ---
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install yt-dlp

# --- Expose backend port ---
EXPOSE 4000

# --- Start backend ---
CMD ["pnpm", "--filter", "apps/backend", "start"]
