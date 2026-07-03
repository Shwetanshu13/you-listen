// routes/preferences.route.ts
import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { preferencesController } from "../modules/preferences/preferences.controller";

const router = Router();

// All preference routes require authentication
router.use(verifyUser);

// GET /api/preferences - Get user preferences
router.get("/", preferencesController.getUserPreferences);

// PUT /api/preferences - Update user preferences
router.put("/", preferencesController.updateUserPreferences);

// POST /api/preferences/reset - Reset preferences to defaults
router.post("/reset", preferencesController.resetUserPreferences);

export default router;
