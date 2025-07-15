// lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | boolean)[]) {
  return twMerge(clsx(inputs));
}
