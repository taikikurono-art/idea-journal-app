import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { listIdeas, createIdea } from "@/lib/store";

export async function GET() {
  const ideas = listIdeas();
  return NextResponse.json({ ideas });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const firstNote = typeof body?.firstNote === "string" ? body.firstNote.trim() : "";

  if (!title) {
    return NextResponse.json({ error: "タイトルを入力してください" }, { status: 400 });
  }

  const idea = createIdea(title, user, firstNote || undefined);
  return NextResponse.json({ idea });
}
