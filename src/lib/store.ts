import { randomUUID } from "crypto";
import { db } from "@/lib/db";

export type NoteRow = {
  id: string;
  ideaId: string;
  content: string;
  authorName: string;
  createdAt: string;
  struckThrough: 0 | 1;
};

export type CommentRow = {
  id: string;
  ideaId: string;
  content: string;
  authorName: string;
  createdAt: string;
};

export type IdeaRow = {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
};

export type IdeaWithChildren = IdeaRow & {
  notes: NoteRow[];
  comments: CommentRow[];
};

export function listIdeas(): (IdeaRow & { notes: NoteRow[]; commentCount: number })[] {
  const ideas = db
    .prepare(`SELECT * FROM ideas ORDER BY createdAt DESC`)
    .all() as IdeaRow[];

  const noteStmt = db.prepare(`SELECT * FROM notes WHERE ideaId = ? ORDER BY createdAt ASC`);
  const countStmt = db.prepare(`SELECT COUNT(*) as c FROM comments WHERE ideaId = ?`);

  return ideas.map((idea) => ({
    ...idea,
    notes: noteStmt.all(idea.id) as NoteRow[],
    commentCount: (countStmt.get(idea.id) as { c: number }).c,
  }));
}

export function getIdea(id: string): IdeaWithChildren | null {
  const idea = db.prepare(`SELECT * FROM ideas WHERE id = ?`).get(id) as IdeaRow | undefined;
  if (!idea) return null;
  const notes = db
    .prepare(`SELECT * FROM notes WHERE ideaId = ? ORDER BY createdAt ASC`)
    .all(id) as NoteRow[];
  const comments = db
    .prepare(`SELECT * FROM comments WHERE ideaId = ? ORDER BY createdAt ASC`)
    .all(id) as CommentRow[];
  return { ...idea, notes, comments };
}

export function createIdea(title: string, authorName: string, firstNote?: string) {
  const id = randomUUID();
  const insertIdea = db.prepare(
    `INSERT INTO ideas (id, title, authorName) VALUES (?, ?, ?)`
  );
  const insertNote = db.prepare(
    `INSERT INTO notes (id, ideaId, content, authorName) VALUES (?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    insertIdea.run(id, title, authorName);
    if (firstNote) {
      insertNote.run(randomUUID(), id, firstNote, authorName);
    }
  });
  tx();

  return getIdea(id)!;
}

export function addNote(ideaId: string, content: string, authorName: string): NoteRow {
  const idea = db.prepare(`SELECT id FROM ideas WHERE id = ?`).get(ideaId);
  if (!idea) throw new Error("not found");

  const id = randomUUID();
  db.prepare(`INSERT INTO notes (id, ideaId, content, authorName) VALUES (?, ?, ?, ?)`).run(
    id,
    ideaId,
    content,
    authorName
  );
  return db.prepare(`SELECT * FROM notes WHERE id = ?`).get(id) as NoteRow;
}

// Correct a note: the original is never edited or deleted — it's flagged
// struckThrough (rendered with a strikethrough) and a brand new note is
// created with the corrected text, preserving the whole trail of thought.
export function correctNote(
  ideaId: string,
  noteId: string,
  content: string,
  authorName: string
): NoteRow {
  const original = db.prepare(`SELECT * FROM notes WHERE id = ?`).get(noteId) as
    | NoteRow
    | undefined;
  if (!original || original.ideaId !== ideaId) {
    throw new Error("not found");
  }
  if (original.struckThrough) {
    throw new Error("already corrected");
  }

  const newId = randomUUID();
  const tx = db.transaction(() => {
    db.prepare(`UPDATE notes SET struckThrough = 1 WHERE id = ?`).run(noteId);
    db.prepare(`INSERT INTO notes (id, ideaId, content, authorName) VALUES (?, ?, ?, ?)`).run(
      newId,
      ideaId,
      content,
      authorName
    );
  });
  tx();

  return db.prepare(`SELECT * FROM notes WHERE id = ?`).get(newId) as NoteRow;
}

export function addComment(ideaId: string, content: string, authorName: string): CommentRow {
  const idea = db.prepare(`SELECT id FROM ideas WHERE id = ?`).get(ideaId);
  if (!idea) throw new Error("not found");

  const id = randomUUID();
  db.prepare(`INSERT INTO comments (id, ideaId, content, authorName) VALUES (?, ?, ?, ?)`).run(
    id,
    ideaId,
    content,
    authorName
  );
  return db.prepare(`SELECT * FROM comments WHERE id = ?`).get(id) as CommentRow;
}
