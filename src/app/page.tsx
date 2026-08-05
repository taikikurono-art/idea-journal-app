import { getCurrentUser } from "@/lib/session";
import { listEntries } from "@/lib/store";
import Header from "@/components/Header";
import DiaryFeed from "@/components/DiaryFeed";

export const dynamic = "force-dynamic";

export default async function DiaryPage() {
      const user = await getCurrentUser();
      const entries = listEntries();

  return (
          <div className="min-h-screen bg-paper">
                <Header userName={user ?? ""} />
                <main className="max-w-2xl mx-auto px-4 py-8">
                        <DiaryFeed initialEntries={entries} />
                </main>
          </div>
        );
}
