// packages/db/src/schema.ts
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";

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

// New tables for v2 features

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const playlistSongs = pgTable("playlist_songs", {
  id: serial("id").primaryKey(),
  playlistId: integer("playlist_id").notNull(),
  songId: integer("song_id").notNull(),
  addedAt: timestamp("added_at").defaultNow(),
  order: integer("order").notNull().default(0),
});

export const songLikes = pgTable("song_likes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  songId: integer("song_id").notNull(),
  likedAt: timestamp("liked_at").defaultNow(),
});

export const playHistory = pgTable("play_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  songId: integer("song_id").notNull(),
  playedAt: timestamp("played_at").defaultNow(),
  duration: integer("duration"), // in seconds
  completed: boolean("completed").default(false),
});

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  autoplay: boolean("autoplay").default(true),
  shuffle: boolean("shuffle").default(false),
  repeatMode: varchar("repeat_mode", { length: 10 }).default("none"), // 'none', 'one', 'all'
  volume: integer("volume").default(100), // 0-100
  updatedAt: timestamp("updated_at").defaultNow(),
});
