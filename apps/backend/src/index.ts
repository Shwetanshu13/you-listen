// index.ts
import express from "express";
import cors from "cors";
import uploadRoute from "./routes/upload.route";
import streamRouter from "./routes/stream.route";
import authRoutes from "./routes/auth.route";
import songsRoutes from "./routes/songs.route";

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Express backend running on http://localhost:${PORT}`);
});
