import express from "express";
import { getSignedAudioUrl } from "../lib/r2";
import { db } from "../lib/db";
import { songs } from "@db/schema";
import { eq } from "drizzle-orm";
import { verifyUser } from "../middleware/verifyUser";

const router = express.Router();

router.get("/stream/:id", verifyUser, async (req, res) => {
  const songId = parseInt(req.params.id);

  if (isNaN(songId)) {
    res.status(400).json({ error: "Invalid song ID" });
    return;
  }

  const result = await db.select().from(songs).where(eq(songs.id, songId));

  if (result.length === 0) {
    res.status(404).json({ error: "Song not found" });
    return;
  }

  const fileUrl = result[0].fileUrl;
  const parts = fileUrl.split("/");
  const key = parts.slice(-1)[0]; // Gets the filename from URL

  try {
    const signedUrl = await getSignedAudioUrl(key);
    res.redirect(signedUrl);
    return;
  } catch (err) {
    console.error("Error generating signed URL:", err);
    res.status(500).json({ error: "Failed to stream audio" });
    return;
  }
});

export default router;
