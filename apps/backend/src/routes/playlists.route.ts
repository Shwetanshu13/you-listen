// routes/playlists.route.ts
import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addSongToPlaylist,
  removeSongFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlists.controller";

const router = Router();

// All playlist routes require authentication
router.use(verifyUser);

// GET /api/playlists - Get user's playlists
router.get("/", getUserPlaylists);

// POST /api/playlists - Create new playlist
router.post("/", createPlaylist);

// GET /api/playlists/:id - Get specific playlist with songs
router.get("/:id", getPlaylistById);

// PUT /api/playlists/:id - Update playlist details
router.put("/:id", updatePlaylist);

// DELETE /api/playlists/:id - Delete playlist
router.delete("/:id", deletePlaylist);

// POST /api/playlists/:id/songs - Add song to playlist
router.post("/:id/songs", addSongToPlaylist);

// DELETE /api/playlists/:id/songs/:songId - Remove song from playlist
router.delete("/:id/songs/:songId", removeSongFromPlaylist);

export default router;
