import { Request, Response } from "express";
import { serialize } from "cookie";
import { authService, AuthService } from "./auth.service";

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;
      const result = await this.service.validateLogin(username, password);

      if (!result) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
      }

      res.setHeader(
        "Set-Cookie",
        serialize("token", result.token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
          path: "/",
          maxAge: 60 * 60 * 24 * 7,
        })
      );

      res.json({
        message: "Login successful",
        user: {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  logout = (req: Request, res: Response): void => {
    res.setHeader(
      "Set-Cookie",
      serialize("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        expires: new Date(0),
      })
    );
    res.json({ message: "Logged out" });
  };

  createUser = async (req: Request, res: Response): Promise<void> => {
    const { username, password, role } = req.body;

    if (
      !username ||
      username.length < 3 ||
      !password ||
      password.length < 6 ||
      !["admin", "user"].includes(role)
    ) {
      res.status(400).json({ error: "Invalid input" });
      return;
    }

    try {
      const user = await this.service.registerUser(username, password, role);
      res.status(201).json({ user });
    } catch (err: any) {
      if (err.message === "User already exists") {
        res.status(400).json({ error: err.message });
        return;
      }
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  };

  getMe = (req: Request, res: Response): void => {
    res.json((req as any).user);
  };
}

export const authController = new AuthController();
