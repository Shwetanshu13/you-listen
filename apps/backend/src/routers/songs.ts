import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { db } from "../lib/db";
import { songs } from "@db/schema";
import { eq, ilike, or } from "drizzle-orm";
import { deleteFromBucket } from "../lib/r2";
import { audioDownloadQueue } from "../queues/audioQueue";
import { isAuthenticated } from "../middleware/isAuthenticated";

export const songsRouter = router({
  getAll: publicProcedure.use(isAuthenticated).query(async () => {
    const result = await db.select().from(songs).orderBy(songs.uploadedAt);
    return result;
  }),

  search: publicProcedure
    .use(isAuthenticated)
    .input(z.string().min(2))
    .query(async ({ input }) => {
      const result = await db
        .select()
        .from(songs)
        .where(ilike(songs.title, `%${input}%`));
      return result;
    }),

  // YT Ingestion placeholder — actual logic coming next
  ytIngestSong: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        artist: z.string(),
        youtubeUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin")
        throw new Error("Only admins can ingest songs via YT Link");

      audioDownloadQueue.add("download", {
        youtubeUrl: input.youtubeUrl,
        userId: ctx.user.username,
        title: input.title,
        artist: input.artist,
      });

      return { message: "Song Upload added to queue" };
    }),

  deleteSong: protectedProcedure
    .input(z.object({ id: z.number(), fileUrl: z.string().url() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can delete songs");
      }
      try {
        // Delete from R2
        await deleteFromBucket(input.fileUrl);
        // Delete from DB
        await db.delete(songs).where(eq(songs.id, input.id));
        return { success: true };
      } catch (error) {
        console.error("Error deleting song:", error);
        return { error: error };
      }
    }),
  searchSongs: publicProcedure
    .use(isAuthenticated)
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ input }) => {
      console.log(input);
      const { query } = input;
      const results = await db
        .select()
        .from(songs)
        .where(
          or(
            ilike(songs.title, `%${query}%`),
            ilike(songs.artist, `%${query}%`)
          )
        );

      return results;
    }),
});
