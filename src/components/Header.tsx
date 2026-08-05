"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header({ userName }: { userName: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-pencil/20 bg-paper/90 backdrop-blur sticky top-0 z-10">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-hand text-ink">
          アイデア帳
        </Link>
        <div className="flex items-center gap-3 text-sm text-pencil">
          <span>{userName} さん</span>
          <button onClick={logout} className="underline hover:text-accent">
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
