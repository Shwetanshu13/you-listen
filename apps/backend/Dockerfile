# --- Base Node Image ---
FROM node:20

# --- Set working directory ---
WORKDIR /app

# --- Install pnpm globally ---
RUN npm install -g pnpm

# --- Copy monorepo ---
COPY . .

# --- Install all deps (not just prod) so tsc & pg/dotenv are available) ---
RUN pnpm install

# --- Build backend ---
RUN pnpm --filter backend build

# --- Optional: prune to only prod deps (light image) ---
RUN pnpm prune --prod

# --- Install Python + yt-dlp ---
RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv && \
    python3 -m venv /yt-venv && \
    /yt-venv/bin/pip install --upgrade pip && \
    /yt-venv/bin/pip install yt-dlp

# --- Expose backend port ---
EXPOSE 4000

# RUN ls -al apps/backend/dist

# --- Start backend ---
CMD ["pnpm", "--filter", "backend", "start"]
