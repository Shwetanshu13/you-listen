import express from "express";
import { usersController } from "../modules/users/users.controller";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

router.get("/all", verifyAdmin, usersController.getAllUsers);
router.delete("/:id", verifyAdmin, usersController.deleteUser);
router.patch("/:id/role", verifyAdmin, usersController.updateUserRole);

export default router;
