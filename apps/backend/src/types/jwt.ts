// apps/backend/src/types/jwt.ts (or wherever you want)
export type JWTPayload = {
  id: number;
  username: string;
  role: "admin" | "user";
};
