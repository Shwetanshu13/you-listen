import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { authRepository, AuthRepository } from "./auth.repo";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  async validateLogin(username: string, password: string) {
    const user = await this.repo.findUserByUsername(username);

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }

    const token = await new SignJWT({
      id: user.id,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    return { user, token };
  }

  async registerUser(username: string, password: string, role: string) {
    const existing = await this.repo.findUserByUsername(username);
    if (existing) {
      throw new Error("User already exists");
    }

    const hashed = await bcrypt.hash(password, 10);
    return await this.repo.createUser({
      username,
      passwordHash: hashed,
      role,
    });
  }
}

export const authService = new AuthService();
