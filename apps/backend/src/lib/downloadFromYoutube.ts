import { create } from "youtube-dl-exec";

const ytdlp = create("yt-dlp"); // ✅ Use system-installed yt-dlp (Python version)

import path from "path";
import fs from "fs/promises";
import { uploadToBucket } from "./r2";
import { parseFile } from "music-metadata";

export const downloadFromYoutube = async (youtubeUrl: string) => {
  try {
    // Create the temp directory if it doesn't exist
    const outputPath = path.resolve("temp_audio");
    await fs.mkdir(outputPath, { recursive: true });

    // console.log("Does temp_audio exist?", await fs.readdir(outputPath));

    // Name the file safely using YouTube video ID
    const match = youtubeUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (!match) throw new Error("Invalid YouTube URL");

    const videoId = match[1];
    const fileName = `${videoId}.mp3`;

    const outputTemplate = path.join(outputPath, fileName).replace(/\\/g, "/"); // For Windows compatibility

    console.log("Using output template:", outputTemplate);

    // Run yt-dlp using youtube-dl-exec
    await ytdlp(youtubeUrl, {
      extractAudio: true,
      audioFormat: "mp3",
      output: outputTemplate,
    });

    // Full local path to downloaded file
    const fullPath = path.join(outputPath, fileName);
    const fileBuffer = await fs.readFile(fullPath);

    // Get duration using music-metadata
    const metadata = await parseFile(fullPath);
    const seconds = metadata.format.duration ?? 0;
    const duration = `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0")}`;

    // Upload to R2 bucket
    const fileUrl = await uploadToBucket(fileBuffer, fileName, "audio/mpeg");

    // Clean up local file
    await fs.rm(fullPath);

    return { fileUrl, duration };
  } catch (error) {
    console.error("yt-dlp download error:", error);
    return { fileUrl: null, duration: null };
  }
};
