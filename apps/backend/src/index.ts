import express from "express";
import cors from "cors";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { router } from "./trpc";
import { exampleRouter, authRouter, songsRouter } from "./routers";
import { createContext } from "./context";
import uploadRoute from "./routes/upload";
import streamRouter from "./routes/stream";

const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  songs: songsRouter,
});

export type AppRouter = typeof appRouter;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000", // ✅ Dynamically set for prod
    credentials: true,
  })
);

app.use((req, _, next) => {
  console.log("🔥 Incoming request:", req.method, req.url);
  next();
});

app.use(express.json());
app.use("/upload", uploadRoute);
app.use(streamRouter);

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// ✅ Use env PORT or fallback to 4000
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`tRPC backend running on http://localhost:${PORT}`);
});
