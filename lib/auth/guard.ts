import { redirect } from "next/navigation";
import type { AuthUser } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/auth/session";

export class AuthRequiredError extends Error {
  constructor() {
    super("Authentication required");
    this.name = "AuthRequiredError";
  }
}

export function assertAdmin(user: AuthUser | null): AuthUser {
  if (!user) {
    throw new AuthRequiredError();
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }
  return user;
}
