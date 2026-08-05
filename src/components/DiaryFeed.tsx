"use client";

import { useState } from "react";
import DiaryEntry, { EntryData } from "@/components/DiaryEntry";

export default function DiaryFeed({ initialEntries }: { initialEntries: EntryData[] }) {
  const [entries, setEntries] = useState<EntryData[]>(initialEntries);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
});
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "書き込みに失敗しました");
        return;
}
      setEntries((prev) => [data.entry, ...prev]);
      setDraft("");
} finally {
      setLoading(false);
}
}

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-24"
          placeholder="今考えていることを書き留める..."
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
{loading ? "書き込み中..." : "書き込む"}
          </button>
        </div>
      </form>

{entries.length === 0 && (
        <p className="text-center text-pencil text-sm py-12">
          まだ何も書かれていません。最初の一文を書き留めてみましょう。
        </p>
      )}

      <div className="space-y-4">
{entries.map((entry) => (
          <DiaryEntry
            key={entry.id}
            entry={entry}
            onChange={(updated) =>
              setEntries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
}
            onDelete={(id) => setEntries((prev) => prev.filter((e) => e.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
