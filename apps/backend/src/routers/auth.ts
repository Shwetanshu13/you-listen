import { z } from "zod";
import bcrypt from "bcrypt";
import { router, protectedProcedure } from "../trpc";
import { db } from "../lib/db";
import { users } from "../../../../packages/db/src/schema";
import { eq } from "drizzle-orm";
// import dotenv from "dotenv";

// dotenv.config({ path: "../../.env" });

const JWT_SECRET = process.env.JWT_SECRET!;
console.log(JWT_SECRET);

export const authRouter = router({
  createUser: protectedProcedure
    .input(
      z.object({
        username: z.string().min(3),
        password: z.string().min(6),
        role: z.enum(["admin", "user"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admin can create users");
      }

      const hashed = await bcrypt.hash(input.password, 10);
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username));
      if (existing.length > 0) throw new Error("User already exists");

      const result = await db
        .insert(users)
        .values({
          username: input.username,
          passwordHash: hashed,
          role: input.role,
        })
        .returning();

      return { user: result[0] };
    }),
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),
});
