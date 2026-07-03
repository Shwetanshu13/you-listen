// routes/songs.route.ts
import express from "express";
import { songsController } from "../modules/songs/songs.controller";
import { verifyUser } from "../middleware/verifyUser";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

router.get("/all", verifyUser, songsController.getAllSongs);
router.get("/:songId/getDetail", verifyUser, songsController.getSongDetail);
router.get("/search/:q", verifyUser, songsController.searchSongs); // GET /songs/search/despacito
router.post("/search", verifyUser, songsController.searchByTitleOrArtist); // POST { query: "..." }

router.post("/ingest", verifyAdmin, songsController.ingestYouTubeSong);
router.delete("/", verifyAdmin, songsController.deleteSong);
router.patch("/:id", verifyAdmin, songsController.updateSong);

export default router;
