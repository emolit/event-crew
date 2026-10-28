import type { ActionResult } from "@/lib/admin/action-result";
import type { AuthUser } from "@/lib/auth/session";
import { getSessionUser } from "@/lib/auth/session";

export function authorizeAdminUser(user: AuthUser | null): ActionResult<AuthUser> {
  return user
    ? { ok: true, data: user }
    : { ok: false, message: "Требуется вход в админ-панель" };
}

export async function authorizeAdminAction(): Promise<ActionResult<AuthUser>> {
  return authorizeAdminUser(await getSessionUser());
}
