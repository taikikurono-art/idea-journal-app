import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { correctNote } from "@/lib/store";

// "Correct" a note: instead of deleting or editing the original text,
// strike it through and add the corrected text as a brand new note.
// This keeps the whole trail of thought visible in the journal.
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string; noteId: string } }
  ) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    if (!content) {
          return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
        }

    try {
          const note = correctNote(params.id, params.noteId, content, user);
          return NextResponse.json({ note });
        } catch (e) {
          const message = e instanceof Error ? e.message : "error";
          if (message === "already corrected") {
                  return NextResponse.json({ error: "既に訂正済みです" }, { status: 400 });
                }
          return NextResponse.json({ error: "not found" }, { status: 404 });
        }
  }
