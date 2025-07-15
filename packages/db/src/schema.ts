// packages/db/src/schema.ts
import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).unique().notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 10 }).default("user"), // 'admin' or 'user'
  createdAt: timestamp("created_at").defaultNow(),
});

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  artist: varchar("artist", { length: 128 }),
  fileUrl: text("file_url").notNull(),
  duration: varchar("duration", { length: 12 }),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  addedBy: varchar("added_by", { length: 64 }), // admin username or ID
});

export const ytSongIds = pgTable("yt_song_ids", {
  id: serial("id").primaryKey(),
  ytSongId: varchar("yt_song_id", { length: 64 }).notNull(),
});
