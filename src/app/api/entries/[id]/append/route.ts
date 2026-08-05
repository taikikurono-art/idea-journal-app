import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { appendToEntry, insertAfterSegment } from "@/lib/store";

// Add more text to an entry. Either at the very end (the normal way a diary
                                                      // entry keeps growing), or -- if afterIndex is given -- right after a
// specific segment, which is how a correction gets written in immediately
// next to the text that was just struck through.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    const afterIndex = typeof body?.afterIndex === "number" ? body.afterIndex : null;

    if (!text) {
          return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
        }

    try {
          const entry =
            afterIndex === null
              ? appendToEntry(params.id, text)
              : insertAfterSegment(params.id, afterIndex, text);
          return NextResponse.json({ entry });
        } catch {
          return NextResponse.json({ error: "not found" }, { status: 404 });
        }
  }
