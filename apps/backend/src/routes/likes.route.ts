// routes/likes.route.ts
import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import {
  toggleSongLike,
  getUserLikedSongs,
  checkSongLikeStatus,
  getSongLikeCount,
} from "../controllers/likes.controller";

const router = Router();

// POST /api/likes/toggle - Toggle like/unlike for a song (requires auth)
router.post("/toggle", verifyUser, toggleSongLike);

// GET /api/likes/songs - Get user's liked songs (requires auth)
router.get("/songs", verifyUser, getUserLikedSongs);

// GET /api/likes/status/:songId - Check if user liked a song (requires auth)
router.get("/status/:songId", verifyUser, checkSongLikeStatus);

// GET /api/likes/count/:songId - Get total like count for a song (public)
router.get("/count/:songId", getSongLikeCount);

export default router;
