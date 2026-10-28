import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { revokeSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: Request): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    revokeSession(token);
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
