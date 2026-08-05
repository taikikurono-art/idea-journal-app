import { NextResponse } from "next/server";
import { getIdea } from "@/lib/store";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
    const idea = getIdea(params.id);
    if (!idea) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ idea });
  }
