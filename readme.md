# 🎵 You Listen

**You Listen** is a private, full-stack music streaming platform that allows authenticated users to search, stream, and manage songs in a clean and modern UI. It features admin-controlled uploads, YouTube song ingestion, audio streaming via signed URLs, and a custom audio player similar to Spotify.

---

## 🚀 Features

- 🎧 Audio streaming with a modern player
- 🔐 Auth with JWT & role-based access (admin, user)
- ⬆️ Admin-only song uploads (MP3 or via YouTube)
- 🔍 Search across uploaded songs
- 📃 Playback history, duration tracking
- 🧠 AI wrapper for YouTube download
- 🔊 Spacebar to play/pause support
- 🗂️ Monorepo with shared DB across frontend/backend
- ☁️ Cloudflare R2 for audio storage (with signed URLs)
- 🧱 Queue-based background download (BullMQ + Redis)
- 📦 Dockerized backend with optional worker setup
- ⚙️ Neon database integration (Postgres)
- 🛡️ Rate limiting + basic security in production

---

## 🧱 Tech Stack

| Frontend     | Backend         | Infra            | Storage / Queue |
| ------------ | --------------- | ---------------- | --------------- |
| Next.js 15   | Express + tRPC  | Railway / Vercel | Cloudflare R2   |
| Tailwind CSS | BullMQ (worker) | Docker           | Redis           |
| Zustand      | Drizzle ORM     | Neon Postgres    | yt-dlp (Python) |

---

## 📁 Monorepo Structure

```

you-listen/
├── apps/
│   ├── web/        # Next.js frontend
│   └── backend/    # Express + tRPC backend
├── packages/
│   └── db/         # Shared Drizzle ORM schema & config
└── .env            # Environment variables (local dev)

```

---

## ⚙️ Environment Variables

**Required:**

- `JWT_SECRET`
- `NEON_DATABASE_URL`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_ENDPOINT`
- `REDIS_URL`

Set these in Railway/Vercel environments. **No need for `dotenv` in production.**

---

## 🐳 Docker (for backend & worker)

### `apps/backend/Dockerfile`

```Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY . .

RUN corepack enable && pnpm install --prod

CMD ["pnpm", "run", "start"]
```

### `apps/backend/.dockerignore`

```
node_modules
.env
dist
```

---

## 🚀 Deployment Guide

### Frontend (Next.js)

- Deploy `apps/web` to **Vercel**
- Set your API base URL to point to Railway backend (e.g. `https://you-listen-api.up.railway.app`)

### Backend (Express + tRPC)

- Deploy `apps/backend` to **Railway**
- Add all required environment variables

### Worker (YouTube download)

- Run it as a **separate service on Railway** or a background worker
- Use the same Redis + DB credentials

---

## 🧪 Dev Commands

```bash
# Web (frontend)
pnpm --filter web dev

# Backend API
pnpm --filter backend dev

# Redis worker (background)
pnpm --filter backend run worker
```

---

## 🔮 v2 Roadmap

- 📚 Library page with history
- 🎵 Playlist creation & shuffle mode
- 🔁 Autoplay next track
- ❤️ Song likes
- ⚡ Song caching (reduce R2 calls)
- 📱 React Native app (via Expo)
- 🧊 Rate limiting + PWA support

---

## 🧑‍💻 Author

Made with ❤️ by [Shwetanshu Sinha](https://github.com/shwetanshusinha)

---

## 📄 License

This project is private. Contact the author for licensing or collaboration.
