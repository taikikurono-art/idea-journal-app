"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewIdeaForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [firstNote, setFirstNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, firstNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "作成に失敗しました");
        return;
      }
      setTitle("");
      setFirstNote("");
      setOpen(false);
      router.push(`/idea/${data.idea.id}`);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border-2 border-dashed border-pencil/30 py-4 text-pencil hover:border-accent hover:text-accent transition text-sm"
      >
        + 新しいアイデアを書き留める
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-pencil/20 bg-white/70 p-5 space-y-3 shadow-sm"
    >
      <input
        autoFocus
        className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
        placeholder="アイデアのタイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-24"
        placeholder="思いついたきっかけや、今考えていることを書いてみる(あとで足せます)"
        value={firstNote}
        onChange={(e) => setFirstNote(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm text-pencil hover:text-ink"
        >
          やめる
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm rounded-lg bg-accent text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "作成中..." : "書き留める"}
        </button>
      </div>
    </form>
  );
}
