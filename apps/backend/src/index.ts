// index.ts
import express from "express";
import cors from "cors";
import uploadRoute from "./routes/upload.route";
import streamRouter from "./routes/stream.route";
import authRoutes from "./routes/auth.route";
import songsRoutes from "./routes/songs.route";
import playlistsRoutes from "./routes/playlists.route";
import likesRoutes from "./routes/likes.route";
import historyRoutes from "./routes/history.route";
import preferencesRoutes from "./routes/preferences.route";

const app = express();

// CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

// Route Mounting
app.use("/auth", authRoutes);
app.use("/upload", uploadRoute);
app.use("/songs", songsRoutes);
app.use("/stream", streamRouter);
app.use("/playlists", playlistsRoutes);
app.use("/likes", likesRoutes);
app.use("/history", historyRoutes);
app.use("/preferences", preferencesRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Express backend running on http://localhost:${PORT}`);
});
