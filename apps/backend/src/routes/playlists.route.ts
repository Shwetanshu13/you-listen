// routes/playlists.route.ts
import { Router } from "express";
import { verifyUser } from "../middleware/verifyUser";
import { playlistsController } from "../modules/playlists/playlists.controller";

const router = Router();

// All playlist routes require authentication
router.use(verifyUser);

// GET /api/playlists - Get user's playlists
router.get("/", playlistsController.getUserPlaylists);

// POST /api/playlists - Create new playlist
router.post("/", playlistsController.createPlaylist);

// GET /api/playlists/:id - Get specific playlist with songs
router.get("/:id", playlistsController.getPlaylistById);

// PUT /api/playlists/:id - Update playlist details
router.put("/:id", playlistsController.updatePlaylist);

// DELETE /api/playlists/:id - Delete playlist
router.delete("/:id", playlistsController.deletePlaylist);

// POST /api/playlists/:id/songs - Add song to playlist
router.post("/:id/songs", playlistsController.addSongToPlaylist);

// DELETE /api/playlists/:id/songs/:songId - Remove song from playlist
router.delete("/:id/songs/:songId", playlistsController.removeSongFromPlaylist);

export default router;
