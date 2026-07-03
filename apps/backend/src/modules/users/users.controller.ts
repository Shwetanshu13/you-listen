import { Request, Response } from "express";
import { usersService, UsersService } from "./users.service";

export class UsersController {
  constructor(private readonly service: UsersService = usersService) {}

  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const allUsers = await this.service.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  };

  deleteUser = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    try {
      await this.service.deleteUser(userId);
      res.json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  };

  updateUserRole = async (req: Request, res: Response): Promise<void> => {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (isNaN(userId)) {
      res.status(400).json({ error: "Invalid user ID" });
      return;
    }

    if (!["admin", "user"].includes(role)) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }

    try {
      const user = await this.service.updateUserRole(userId, role);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({ success: true, user });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: "Failed to update user role" });
    }
  };
}

export const usersController = new UsersController();
