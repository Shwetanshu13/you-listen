// src/middleware/isAuthenticated.ts
import { TRPCError } from "@trpc/server";
import { middleware } from "../trpc";

export const isAuthenticated = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Login required" });
  }

  return next({ ctx: { user: ctx.user } });
});
