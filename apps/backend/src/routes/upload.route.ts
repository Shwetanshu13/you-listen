// apps/backend/src/routes/upload.ts
import express from "express";
import multer from "multer";
import { db } from "../lib/db";
import { songs } from "../db/schema";
import { parseBuffer } from "music-metadata";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { uploadToBucket } from "../lib/r2";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/song", verifyAdmin, upload.single("file"), async (req, res) => {
  const user = (req as any).user;
  const addedBy = user.username;

  const file = req.file;
  const title = req.body.title;
  const artist = req.body.artist || "Unknown";

  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }
  if (!title) {
    res.status(400).json({ message: "Title is required" });
    return;
  }

  // 1. Parse duration
  const metadata = await parseBuffer(file.buffer, file.mimetype);
  const durationInSeconds = metadata.format.duration ?? 0;
  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60);
  const formattedDuration = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  // 2. Upload file to R2
  const fileUrl = await uploadToBucket(
    file.buffer,
    file.originalname,
    file.mimetype
  );

  // 3. Save in DB
  await db.insert(songs).values({
    title,
    artist,
    fileUrl,
    duration: formattedDuration,
    addedBy,
  });

  res.json({ message: "Upload complete", fileUrl });
});

export default router;
