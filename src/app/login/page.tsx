"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "ログインに失敗しました");
        return;
      }
      router.push(params.get("next") || "/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white/70 border border-pencil/20 rounded-2xl shadow-sm p-8 space-y-5"
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-hand text-ink">アイデア帳</h1>
          <p className="text-sm text-pencil">
            知人だけに共有している、考え中のアイデア置き場です
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-pencil">お名前(表示名)</label>
          <input
            className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: たいき"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-pencil">合言葉</label>
          <input
            type="password"
            className="w-full rounded-lg border border-pencil/30 bg-paper px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="共有された合言葉を入力"
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent text-white py-2 font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "確認中..." : "入る"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
