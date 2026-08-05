"use client";

import { useState } from "react";

type Note = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  struckThrough: boolean;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function NoteRow({
  note,
  ideaId,
  onCorrected,
}: {
  note: Note;
  ideaId: string;
  onCorrected: (newNote: Note) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submitCorrection(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${ideaId}/notes/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "訂正に失敗しました");
        return;
      }
      setEditing(false);
      onCorrected(data.note);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="group relative pl-4 border-l-2 border-pencil/20">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs text-pencil">
          {note.authorName} ・ {formatDate(note.createdAt)}
        </span>
        {!note.struckThrough && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-pencil underline opacity-0 group-hover:opacity-100 hover:text-accent transition"
          >
            訂正する
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={submitCorrection} className="mt-1 space-y-2">
          <p className="note-strike whitespace-pre-wrap text-ink/70 text-sm">
            {note.content}
          </p>
          <textarea
            autoFocus
            className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-20"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setDraft(note.content);
              }}
              className="px-3 py-1 text-xs text-pencil hover:text-ink"
            >
              やめる
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 text-xs rounded-lg bg-accent text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "訂正中..." : "訂正線を引いて書き直す"}
            </button>
          </div>
        </form>
      ) : (
        <p
          className={`whitespace-pre-wrap ${note.struckThrough ? "note-strike" : "text-ink"}`}
        >
          {note.content}
        </p>
      )}
    </div>
  );
}

export default function IdeaJournal({
  ideaId,
  initialNotes,
}: {
  ideaId: string;
  initialNotes: Note[];
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${ideaId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "追加に失敗しました");
        return;
      }
      setNotes((prev) => [...prev, data.note]);
      setDraft("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        {notes.map((note) => (
          <NoteRow
            key={note.id}
            note={note}
            ideaId={ideaId}
            onCorrected={(newNote) => {
              setNotes((prev) => {
                const marked = prev.map((n) =>
                  n.id === note.id ? { ...n, struckThrough: true } : n
                );
                return [...marked, newNote];
              });
            }}
          />
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-2 pt-2">
        <textarea
          className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-20"
          placeholder="今考えていることを書き足す..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "追加中..." : "書き足す"}
          </button>
        </div>
      </form>
    </div>
  );
}
