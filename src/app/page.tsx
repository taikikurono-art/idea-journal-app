import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { listIdeas } from "@/lib/store";
import Header from "@/components/Header";
import NewIdeaForm from "@/components/NewIdeaForm";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function BoardPage() {
  const user = await getCurrentUser();
  const ideas = listIdeas();

  return (
    <div className="min-h-screen bg-paper">
      <Header userName={user ?? ""} />
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <NewIdeaForm />

        {ideas.length === 0 && (
          <p className="text-center text-pencil text-sm py-12">
            まだアイデアがありません。最初の一つを書き留めてみましょう。
          </p>
        )}

        <div className="space-y-4">
          {ideas.map((idea) => {
            const activeNotes = idea.notes.filter((n) => !n.struckThrough);
            const latest = activeNotes[activeNotes.length - 1] ?? idea.notes[idea.notes.length - 1];
            return (
              <Link
                key={idea.id}
                href={`/idea/${idea.id}`}
                className="block rounded-xl border border-pencil/20 bg-white/70 p-5 shadow-sm hover:shadow-md hover:border-accent/40 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg text-ink truncate">{idea.title}</h2>
                    {latest && (
                      <p className="text-sm text-pencil mt-1 line-clamp-2">
                        {latest.content}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-pencil whitespace-nowrap text-right shrink-0">
                    <div>{idea.authorName}</div>
                    <div>{formatDate(idea.createdAt)}</div>
                  </div>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-pencil">
                  <span>思考の記録 {idea.notes.length}件</span>
                  <span>コメント {idea.commentCount}件</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
