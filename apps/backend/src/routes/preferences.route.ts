// routes/preferences.route.ts
import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import {
  getUserPreferences,
  updateUserPreferences,
  resetUserPreferences,
} from "../controllers/preferences.controller";

const router = Router();

// All preference routes require authentication
router.use(verifyUser);

// GET /api/preferences - Get user preferences
router.get("/", getUserPreferences);

// PUT /api/preferences - Update user preferences
router.put("/", updateUserPreferences);

// POST /api/preferences/reset - Reset preferences to defaults
router.post("/reset", resetUserPreferences);

export default router;
