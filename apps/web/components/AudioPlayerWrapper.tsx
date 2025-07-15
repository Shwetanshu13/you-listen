// components/AudioPlayerWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import AudioPlayer from "./AudioPlayer";

export default function AudioPlayerWrapper() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return <AudioPlayer />;
}
