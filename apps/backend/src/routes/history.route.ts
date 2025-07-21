// routes/history.route.ts
import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import {
  addToPlayHistory,
  getUserPlayHistory,
  getRecentlyPlayed,
  getMostPlayed,
  clearPlayHistory,
} from "../controllers/history.controller";

const router = Router();

// All history routes require authentication
router.use(verifyUser);

// POST /api/history - Add song to play history
router.post("/", addToPlayHistory);

// GET /api/history - Get user's play history
router.get("/", getUserPlayHistory);

// GET /api/history/recent - Get recently played songs (unique)
router.get("/recent", getRecentlyPlayed);

// GET /api/history/most-played - Get most played songs
router.get("/most-played", getMostPlayed);

// DELETE /api/history - Clear user's play history
router.delete("/", clearPlayHistory);

export default router;
