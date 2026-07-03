// routes/history.route.ts
import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { historyController } from "../modules/history/history.controller";

const router = Router();

// All history routes require authentication
router.use(verifyUser);

// POST /api/history - Add song to play history
router.post("/", historyController.addToPlayHistory);

// GET /api/history - Get user's play history
router.get("/", historyController.getUserPlayHistory);

// GET /api/history/recent - Get recently played songs (unique)
router.get("/recent", historyController.getRecentlyPlayed);

// GET /api/history/most-played - Get most played songs
router.get("/most-played", historyController.getMostPlayed);

// DELETE /api/history - Clear user's play history
router.delete("/", historyController.clearPlayHistory);

export default router;
