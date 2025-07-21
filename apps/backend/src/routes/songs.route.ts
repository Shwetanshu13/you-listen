// routes/songs.route.ts
import express from "express";
import {
  getAllSongs,
  getSongDetail,
  searchSongs,
  searchByTitleOrArtist,
  ingestYouTubeSong,
  deleteSong,
} from "../controllers/songs.controller";
import { verifyUser } from "../middleware/verifyUser";
import { verifyAdmin } from "../middleware/verifyAdmin";

const router = express.Router();

router.get("/all", verifyUser, getAllSongs);
router.get("/:songId/getDetail", verifyUser, getSongDetail);
router.get("/search/:q", verifyUser, searchSongs); // GET /songs/search/despacito
router.post("/search", verifyUser, searchByTitleOrArtist); // POST { query: "..." }

router.post("/ingest", verifyAdmin, ingestYouTubeSong);
router.delete("/", verifyAdmin, deleteSong);

export default router;
