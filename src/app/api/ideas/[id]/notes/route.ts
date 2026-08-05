import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { addNote } from "@/lib/store";

// Add a fresh note to the running journal for this idea.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    if (!content) {
          return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
        }

    try {
          const note = addNote(params.id, content, user);
          return NextResponse.json({ note });
        } catch {
          return NextResponse.json({ error: "not found" }, { status: 404 });
        }
  }
