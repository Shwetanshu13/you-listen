import express from "express";
import {
  getAllUsers,
  deleteUser,
  updateUserRole,
} from "../controllers/users.controller";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

router.get("/all", verifyAdmin, getAllUsers);
router.delete("/:id", verifyAdmin, deleteUser);
router.patch("/:id/role", verifyAdmin, updateUserRole);

export default router;
