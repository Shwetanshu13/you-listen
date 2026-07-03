// routes/auth.route.ts
import express from "express";
import { authController } from "../modules/auth/auth.controller";
import { verifyUser } from "../middleware/verifyUser";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

// POST /auth/login
router.post("/login", authController.login);

// POST /auth/logout
router.post("/logout", authController.logout);

// POST /auth/create-user — only admin
router.post("/create-user", verifyAdmin, authController.createUser);

// GET /auth/me — any logged-in user
router.get("/me", verifyUser, authController.getMe);

export default router;
