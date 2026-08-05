import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "dev.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const globalForDb = globalThis as unknown as { __db?: Database.Database };

export const db = globalForDb.__db ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") globalForDb.__db = db;

db.pragma("journal_mode = WAL");

// A single shared journal: everyone writes into the same running feed of
// dated entries. Nothing is ever deleted or overwritten -- "content" holds a
// JSON array of segments ({ text, struck }), and corrections only ever add
// to that array (splitting a segment to mark part of it struck-through, or
// appending/inserting new text). See src/lib/store.ts.
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
      id TEXT PRIMARY KEY,
          authorName TEXT NOT NULL,
              createdAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
                  updatedAt TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
                      content TEXT NOT NULL
                        );

                          CREATE INDEX IF NOT EXISTS idx_entries_created ON entries(createdAt);
                          `);
