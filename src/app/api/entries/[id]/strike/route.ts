import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { strikeRange } from "@/lib/store";

// Strike through a range of characters within one (not-yet-struck) segment
// of an entry. The text is never removed -- it's split off and flagged
// struck, so the full trail of what was written and crossed out stays
// visible forever.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const segmentIndex = typeof body?.segmentIndex === "number" ? body.segmentIndex : -1;
  const start = typeof body?.start === "number" ? body.start : -1;
  const end = typeof body?.end === "number" ? body.end : -1;

  try {
    const { entry, struckIndex } = strikeRange(params.id, segmentIndex, start, end);
    return NextResponse.json({ entry, struckIndex });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    if (message === "already struck") {
      return NextResponse.json({ error: "既に取り消し線が引かれています" }, { status: 400 });
    }
    if (message === "invalid range") {
      return NextResponse.json({ error: "選択範囲が正しくありません" }, { status: 400 });
    }
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}
