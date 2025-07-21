// packages/db/drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: "../../.env" }); // Adjust path if needed
const dbUrl = process.env.DATABASE_URL!;

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: dbUrl,
  },
});
