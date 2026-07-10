# 🎵 You Listen

**You Listen** is a private, full-stack music streaming platform that allows authenticated users to search, stream, and manage songs in a clean and modern UI. It features admin-controlled uploads, YouTube song ingestion, audio streaming via signed URLs, and a custom audio player similar to Spotify.

---

## 🚀 Features

- 🎧 **Audio Streaming**: Modern, persistent player with shuffle, autoplay, and repeat controls.
- 🔐 **Authentication**: JWT auth with role-based access (admin, user).
- 🗂️ **Playlists & Likes**: Create custom playlists and like your favorite songs.
- 📃 **Play History**: Track playback history and recently played songs.
- ⚙️ **User Preferences**: Save volume, shuffle, repeat, and autoplay settings.
- ⚡ **Performance Optimized**: Infinite scrolling on the frontend with a dual-layer caching strategy (Redis on backend, SessionStorage on client).
- 🏗️ **Modular Backend**: Clean Layered Architecture (Repository-Service-Controller) for maintainability and scalability.
- ⬆️ **Admin Uploads**: Upload songs via MP3 files or ingest directly from YouTube (yt-dlp + BullMQ).
- ☁️ **Cloud Storage**: Cloudflare R2 for fast audio delivery with signed URLs.

---

## 🧱 Tech Stack

| Frontend     | Backend                 | Infra            | Storage / Queue |
| ------------ | ----------------------- | ---------------- | --------------- |
| Next.js 15   | Express.js              | Railway / Vercel | Cloudflare R2   |
| Tailwind CSS | Layered Architecture    | Docker           | Redis           |
| Zustand      | BullMQ (Worker)         | Neon Postgres    | yt-dlp (Python) |
| Axios        | Drizzle ORM             | SessionStorage   | -               |

---

## 📁 Monorepo Structure

```
you-listen/
├── apps/
│   ├── web/        # Next.js frontend
│   └── backend/    # Express modular backend (src/modules/*)
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

## 🚀 Deployment Guide

### Frontend (Next.js)

- Deploy `apps/web` to **Vercel**
- Set `NEXT_PUBLIC_BACKEND_URL` to point to Railway backend (e.g., `https://you-listen-api.up.railway.app/api`)

### Backend (Express)

- Deploy `apps/backend` to **Railway**
- Backend uses a Node environment (no Docker required since the Dockerfile was removed for simpler Render/Railway node environments)
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

## 🔮 Roadmap / Future Features

- 📱 React Native app (via Expo)
- 🧊 Rate limiting + PWA support
- 📊 Admin Analytics Dashboard
- 🎧 Collaborative Playlists

---

## 🧑‍💻 Author

Made with ❤️ by [Shwetanshu Sinha](https://github.com/shwetanshusinha)

---

## 📄 License

This project is private. Contact the author for licensing or collaboration.
