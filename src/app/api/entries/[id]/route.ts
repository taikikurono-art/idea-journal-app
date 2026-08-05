import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { deleteEntry } from "@/lib/store";

// Delete an entire entry (e.g. a test post or mistaken entry). Unlike
// corrections, this removes the whole entry — not part of its wording.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  deleteEntry(params.id);
  return NextResponse.json({ ok: true });
}
