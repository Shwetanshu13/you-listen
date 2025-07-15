// apps/backend/src/lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../../packages/db/src/schema";
// import dotenv from "dotenv";

// dotenv.config({ path: "../../.env" });

const dbUrl = process.env.DATABASE_URL!;

const pool = new Pool({
  connectionString: dbUrl,
});

export const db = drizzle(pool, { schema });
