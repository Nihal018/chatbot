import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";

const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle> | undefined;
};

if (!globalForDb.db) {
  globalForDb.db = drizzle(sql);
}

export const db = globalForDb.db!;
