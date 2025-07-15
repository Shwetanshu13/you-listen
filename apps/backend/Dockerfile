FROM node:20-alpine

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

# Copy everything
COPY . .

# Install deps
RUN pnpm install

# Build only backend
RUN pnpm --filter backend build

# Fix path for production run
CMD ["node", "apps/backend/dist/apps/backend/src/index.js"]
