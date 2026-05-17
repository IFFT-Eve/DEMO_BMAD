import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("DATABASE_URL is not set");

  const filePath = dbUrl.replace(/^file:/, "");
  const adapter = new PrismaBetterSqlite3({ url: filePath });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new PrismaClient({ adapter } as any);
}

// Module-level singleton to avoid re-instantiation across Next.js hot-reloads.
const globalForPrisma = globalThis as unknown as { db: PrismaClient | undefined };

export const db = globalForPrisma.db ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.db = db;
