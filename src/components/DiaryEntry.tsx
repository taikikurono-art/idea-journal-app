"use client";

import { useState } from "react";

export type Segment = { text: string; struck: boolean };

export type EntryData = {
  id: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  segments: Segment[];
};

function formatDateTime(iso: string) {
    return new Intl.DateTimeFormat("ja-JP", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
      }).format(new Date(iso));
}

// Walk up from a selection endpoint to the nearest [data-seg] span, so we
// know which segment (and only which segment) the user actually selected.
function closestSegmentSpan(node: Node): HTMLElement | null {
    let el: HTMLElement | null =
      node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
  while (el) {
    if (el.dataset && el.dataset.seg !== undefined) return el;
    el = el.parentElement;
  }
  return null;
}

// Character offset of (node, offset) relative to the start of `container`.
function offsetWithin(container: HTMLElement, node: Node, offset: number): number {
    const range = document.createRange();
  range.selectNodeContents(container);
  range.setEnd(node, offset);
  return range.toString().length;
}

type PendingSelection = { segmentIndex: number; start: number; end: number };

export default function DiaryEntry({
  entry,
  onChange, onDelete,
}: {
  entry: EntryData;
  onChange: (entry: EntryData) => void; onDelete: (id: string) => void;
}) {
  const [selection, setSelection] = useState<PendingSelection | null>(null);
  const [striking, setStriking] = useState(false);
  const [strikeError, setStrikeError] = useState<string | null>(null); const [deleting, setDeleting] = useState(false);

  const [insertAfter, setInsertAfter] = useState<number | null>(null);
  const [insertDraft, setInsertDraft] = useState("");
  const [inserting, setInserting] = useState(false);

  const [appendOpen, setAppendOpen] = useState(false);
  const [appendDraft, setAppendDraft] = useState("");
  const [appending, setAppending] = useState(false);

  function handleMouseUp() {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setSelection(null);
      return;
}
    const range = sel.getRangeAt(0);
    const startSpan = closestSegmentSpan(range.startContainer);
    const endSpan = closestSegmentSpan(range.endContainer);

    if (!startSpan || !endSpan) {
      setSelection(null);
      return;
}
    if (startSpan !== endSpan) {
      setSelection(null);
      setStrikeError("1つの文の範囲内で選択してください（取り消し線と書き足された文をまたいでは選べません）");
      return;
}

    const segIndex = Number(startSpan.dataset.seg);
    if (Number.isNaN(segIndex)) {
      setSelection(null);
      return;
}

    const a = offsetWithin(startSpan, range.startContainer, range.startOffset);
    const b = offsetWithin(startSpan, range.endContainer, range.endOffset);
    const start = Math.min(a, b);
    const end = Math.max(a, b);
    if (start === end) {
      setSelection(null);
      return;
}

    setStrikeError(null);
    setSelection({ segmentIndex: segIndex, start, end });
}

  async function submitStrike() {
    if (!selection) return;
    setStriking(true);
    setStrikeError(null);
    try {
      const res = await fetch(`/api/entries/${entry.id}/strike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(selection),
});
      const data = await res.json();
      if (!res.ok) {
        setStrikeError(data.error ?? "取り消し線を引けませんでした");
        return;
}
      onChange(data.entry);
      setSelection(null);
      window.getSelection()?.removeAllRanges();
      setInsertAfter(data.struckIndex);
      setInsertDraft("");
} finally {
      setStriking(false);
}
}

  async function submitInsert(e: React.FormEvent) {
    e.preventDefault();
    if (insertAfter === null || !insertDraft.trim()) return;
    setInserting(true);
    try {
      const res = await fetch(`/api/entries/${entry.id}/append`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: insertDraft.trim(), afterIndex: insertAfter }),
});
      const data = await res.json();
      if (res.ok) {
        onChange(data.entry);
        setInsertAfter(null);
        setInsertDraft("");
}
} finally {
      setInserting(false);
}
}

  async function handleDelete() { if (!window.confirm("この投稿を削除します。よろしいですか？(取り消し線と違い、元に戻せません)")) { return; } setDeleting(true); try { const res = await fetch(`/api/entries/${entry.id}`, { method: "DELETE" }); if (res.ok) onDelete(entry.id); } finally { setDeleting(false); } }  async function submitAppend(e: React.FormEvent) {
    e.preventDefault();
    if (!appendDraft.trim()) return;
    setAppending(true);
    try {
      const res = await fetch(`/api/entries/${entry.id}/append`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: appendDraft.trim() }),
});
      const data = await res.json();
      if (res.ok) {
        onChange(data.entry);
        setAppendDraft("");
        setAppendOpen(false);
}
} finally {
      setAppending(false);
}
}

  return (
    <div className="rounded-xl border border-pencil/20 bg-white/70 p-5 shadow-sm">
      <div className="text-xs text-pencil mb-2 flex items-center justify-between"><span>
{entry.authorName}</span><button onClick={handleDelete} disabled={deleting} className="text-pencil/60 hover:text-red-600 disabled:opacity-50">{deleting ? "削除中..." : "削除"}</button> ・ {formatDateTime(entry.createdAt)}
      </div>

      <p onMouseUp={handleMouseUp} className="whitespace-pre-wrap leading-relaxed text-ink">
{entry.segments.map((seg, i) =>
          seg.struck ? (
            <del key={i} className="note-strike">
{seg.text}
            </del>
          ) : (
            <span key={i} data-seg={i}>
{seg.text}
            </span>
          )
        )}
      </p>

{selection && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <button
            onClick={submitStrike}
            disabled={striking}
            className="px-3 py-1 rounded-lg bg-accent text-white hover:opacity-90 disabled:opacity-50"
          >
{striking ? "処理中..." : "選択した部分に取り消し線を引く"}
          </button>
          <button onClick={() => setSelection(null)} className="text-pencil hover:text-ink">
            キャンセル
          </button>
        </div>
      )}
{strikeError && <p className="mt-1 text-xs text-red-600">{strikeError}</p>}

{insertAfter !== null && (
        <form onSubmit={submitInsert} className="mt-3 space-y-2 border-t border-pencil/10 pt-3">
          <p className="text-xs text-pencil">取り消し線のすぐ続きに書き直す:</p>
          <textarea
            autoFocus
            className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-16"
            value={insertDraft}
            onChange={(e) => setInsertDraft(e.target.value)}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setInsertAfter(null)}
              className="px-3 py-1 text-xs text-pencil hover:text-ink"
            >
              あとで書く
            </button>
            <button
              type="submit"
              disabled={inserting}
              className="px-3 py-1 text-xs rounded-lg bg-accent text-white hover:opacity-90 disabled:opacity-50"
            >
{inserting ? "追加中..." : "書き加える"}
            </button>
          </div>
        </form>
      )}

{insertAfter === null &&
        (appendOpen ? (
          <form onSubmit={submitAppend} className="mt-3 space-y-2 border-t border-pencil/10 pt-3">
            <textarea
              autoFocus
              className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 min-h-16"
              placeholder="続きを書き足す..."
              value={appendDraft}
              onChange={(e) => setAppendDraft(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setAppendOpen(false);
                  setAppendDraft("");
}}
                className="px-3 py-1 text-xs text-pencil hover:text-ink"
              >
                やめる
              </button>
              <button
                type="submit"
                disabled={appending}
                className="px-3 py-1 text-xs rounded-lg bg-accent text-white hover:opacity-90 disabled:opacity-50"
              >
{appending ? "追加中..." : "書き足す"}
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAppendOpen(true)}
            className="mt-3 text-xs text-pencil underline hover:text-accent"
          >
            続きを書き足す
          </button>
        ))}
    </div>
  );
}
