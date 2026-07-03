// apps/backend/src/lib/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../db/schema";

// On DEV, uncomment these two lines below
// import dotenv from "dotenv";
// dotenv.config({ path: "../../.env" });

const dbUrl = process.env.DATABASE_URL!;
console.log("database url on db.ts", dbUrl);

const pool = new Pool({
  connectionString: dbUrl,
});

export const db = drizzle(pool, { schema });
