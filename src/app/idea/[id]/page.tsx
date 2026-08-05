import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getIdea } from "@/lib/store";
import Header from "@/components/Header";
import IdeaJournal from "@/components/IdeaJournal";
import CommentsSection from "@/components/CommentsSection";

export const dynamic = "force-dynamic";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
          month: "short",
              day: "numeric",
                }).format(new Date(iso));
                }

                export default async function IdeaPage({ params }: { params: { id: string } }) {
                  const user = await getCurrentUser();
                    const idea = getIdea(params.id);

                      if (!idea) notFound();

                        return (
                            <div className="min-h-screen bg-paper">
                                  <Header userName={user ?? ""} />
                                        <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
                                                <div>
                                                          <Link href="/" className="text-xs text-pencil hover:text-accent underline">
                                                                      ← アイデア帳に戻る
                                                                                </Link>
                                                                                          <h1 className="text-2xl text-ink mt-2">{idea.title}</h1>
                                                                                                    <p className="text-xs text-pencil mt-1">
                                                                                                                {idea.authorName} が {formatDate(idea.createdAt)} に書き始めた
                                                                                                                          </p>
                                                                                                                                  </div>
                                                                                                                                  
                                                                                                                                          <IdeaJournal
                                                                                                                                                    ideaId={idea.id}
                                                                                                                                                              initialNotes={idea.notes.map((n) => ({
                                                                                                                                                                          id: n.id,
                                                                                                                                                                                      content: n.content,
                                                                                                                                                                                                  authorName: n.authorName,
                                                                                                                                                                                                              createdAt: n.createdAt,
                                                                                                                                                                                                                          struckThrough: Boolean(n.struckThrough),
                                                                                                                                                                                                                                    }))}
                                                                                                                                                                                                                                            />
                                                                                                                                                                                                                                            
                                                                                                                                                                                                                                                    <hr className="border-pencil/20" />
                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                            <CommentsSection
                                                                                                                                                                                                                                                                      ideaId={idea.id}
                                                                                                                                                                                                                                                                                initialComments={idea.comments.map((c) => ({
                                                                                                                                                                                                                                                                                            id: c.id,
                                                                                                                                                                                                                                                                                                        content: c.content,
                                                                                                                                                                                                                                                                                                                    authorName: c.authorName,
                                                                                                                                                                                                                                                                                                                                createdAt: c.createdAt,
                                                                                                                                                                                                                                                                                                                                          }))}
                                                                                                                                                                                                                                                                                                                                                  />
                                                                                                                                                                                                                                                                                                                                                        </main>
                                                                                                                                                                                                                                                                                                                                                            </div>
                                                                                                                                                                                                                                                                                                                                                              );
                                                                                                                                                                                                                                                                                                                                                              }
                                                                                                                                                                                                                                                                                                                                                              
