import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

export async function getCurrentUser(): Promise<string | null> {
  const cookie = cookies().get(SESSION_COOKIE)?.value;
  return verifySession(cookie);
}
