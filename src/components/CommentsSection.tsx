"use client";

import { useState } from "react";

type Comment = {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function CommentsSection({
  ideaId,
  initialComments,
}: {
  ideaId: string;
  initialComments: Comment[];
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/ideas/${ideaId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "投稿に失敗しました");
        return;
      }
      setComments((prev) => [...prev, data.comment]);
      setDraft("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm text-pencil">コメント</h2>
      <div className="space-y-3">
        {comments.length === 0 && (
          <p className="text-sm text-pencil">まだコメントはありません。</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg bg-white/60 border border-pencil/10 px-3 py-2">
            <div className="text-xs text-pencil">
              {c.authorName} ・ {formatDate(c.createdAt)}
            </div>
            <p className="text-sm text-ink whitespace-pre-wrap mt-0.5">{c.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-16 text-sm"
          placeholder="感想やアドバイスを書く..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-ink text-paper hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "投稿中..." : "コメントする"}
          </button>
        </div>
      </form>
    </div>
  );
}
