import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { listEntries, createEntry } from "@/lib/store";

export async function GET() {
  const entries = listEntries();
    return NextResponse.json({ entries });
    }

    export async function POST(req: NextRequest) {
      const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

          const body = await req.json().catch(() => null);
            const content = typeof body?.content === "string" ? body.content.trim() : "";
              if (!content) {
                  return NextResponse.json({ error: "内容を入力してください" }, { status: 400 });
                    }

                      const entry = createEntry(content, user);
                        return NextResponse.json({ entry });
                        }
                        
