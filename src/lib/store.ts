import { randomUUID } from "crypto";
import { db } from "@/lib/db";

// A "segment" is a run of text within an entry. Once written, a segment's
// text is never edited or removed — the only things that can ever happen to
// it are: it gets flagged struck (when someone strikes it through), or new
// segments get added around it. This is what makes corrections traceable:
// the whole history of what was written and crossed out stays visible.
export type Segment = { text: string; struck: boolean };

type EntryRow = {
  id: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  content: string; // JSON-encoded Segment[]
};

export type Entry = {
  id: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  segments: Segment[];
};

function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    authorName: row.authorName,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    segments: JSON.parse(row.content) as Segment[],
  };
}

function getRow(id: string): EntryRow | undefined {
  return db.prepare(`SELECT * FROM entries WHERE id = ?`).get(id) as EntryRow | undefined;
}

function saveSegments(id: string, segments: Segment[]) {
  db.prepare(
    `UPDATE entries SET content = ?, updatedAt = strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE id = ?`
  ).run(JSON.stringify(segments), id);
}

// Newest first, so a freshly written entry appears right under the compose
// box instead of at the bottom of a long scroll.
export function listEntries(): Entry[] {
  const rows = db.prepare(`SELECT * FROM entries ORDER BY createdAt DESC`).all() as EntryRow[];
  return rows.map(toEntry);
}

export function getEntry(id: string): Entry | null {
  const row = getRow(id);
  return row ? toEntry(row) : null;
}

// Remove an entire entry. This is different from a correction: corrections
// (strikeRange) always keep the original wording visible, but this is for
// removing a whole entry that should never have been posted (a test entry,
// a mistaken post) — not for erasing part of what someone actually meant to
// keep on the record.
export function deleteEntry(id: string): void {
  db.prepare(`DELETE FROM entries WHERE id = ?`).run(id);
}

export function createEntry(content: string, authorName: string): Entry {
  const id = randomUUID();
  const segments: Segment[] = [{ text: content, struck: false }];
  db.prepare(`INSERT INTO entries (id, authorName, content) VALUES (?, ?, ?)`).run(
    id,
    authorName,
    JSON.stringify(segments)
  );
  return getEntry(id)!;
}

// Add more text to the end of an entry — the normal way a diary entry keeps
// growing over time.
export function appendToEntry(id: string, text: string): Entry {
  const row = getRow(id);
  if (!row) throw new Error("not found");
  const segments = JSON.parse(row.content) as Segment[];
  segments.push({ text, struck: false });
  saveSegments(id, segments);
  return getEntry(id)!;
}

// Insert new text right after a given segment. Used right after striking
// something through, so the corrected wording can sit exactly where the old
// text was instead of only ever landing at the very end of the entry.
export function insertAfterSegment(id: string, afterIndex: number, text: string): Entry {
  const row = getRow(id);
  if (!row) throw new Error("not found");
  const segments = JSON.parse(row.content) as Segment[];
  if (afterIndex < -1 || afterIndex >= segments.length) throw new Error("invalid position");
  segments.splice(afterIndex + 1, 0, { text, struck: false });
  saveSegments(id, segments);
  return getEntry(id)!;
}

// Strike through part (or all) of an existing, not-yet-struck segment. The
// characters themselves are never deleted — the range is split off into its
// own segment and flagged struck, everything else is left exactly as it was.
// Returns the updated entry plus the index of the newly-struck segment, so
// the caller can offer to write the correction in immediately afterward.
export function strikeRange(
  id: string,
  segmentIndex: number,
  start: number,
  end: number
): { entry: Entry; struckIndex: number } {
  const row = getRow(id);
  if (!row) throw new Error("not found");
  const segments = JSON.parse(row.content) as Segment[];
  const seg = segments[segmentIndex];
  if (!seg) throw new Error("segment not found");
  if (seg.struck) throw new Error("already struck");
  if (start < 0 || end > seg.text.length || start >= end) {
    throw new Error("invalid range");
  }

  const before = seg.text.slice(0, start);
  const middle = seg.text.slice(start, end);
  const after = seg.text.slice(end);

  const replacement: Segment[] = [];
  if (before) replacement.push({ text: before, struck: false });
  const struckIndex = segmentIndex + replacement.length;
  replacement.push({ text: middle, struck: true });
  if (after) replacement.push({ text: after, struck: false });

  segments.splice(segmentIndex, 1, ...replacement);
  saveSegments(id, segments);

  return { entry: getEntry(id)!, struckIndex };
}
