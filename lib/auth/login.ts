import type { Database } from "@/lib/db/client";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, type AuthUser } from "@/lib/auth/session";

interface LoginOptions {
  db?: Database;
  now?: Date;
  ipHash?: string | null;
  userAgent?: string | null;
}

export type AuthenticationResult =
  | { ok: true; user: AuthUser; token: string }
  | { ok: false; message: "Неверный логин или пароль" };

let dummyPasswordHash: Promise<string> | null = null;

export async function authenticateCredentials(
  username: string,
  password: string,
  options: LoginOptions = {},
): Promise<AuthenticationResult> {
  const db = options.db ?? authDatabase();
  const row = db
    .prepare(
      "SELECT id, username, password_hash, role FROM users WHERE username = ? COLLATE NOCASE AND is_active = 1",
    )
    .get(username.trim()) as
    | { id: number; username: string; password_hash: string; role: "owner" | "editor" }
    | undefined;
  const fallback = (dummyPasswordHash ??= hashPassword("event-crew-dummy-password"));
  const passwordMatches = await verifyPassword(password, row?.password_hash ?? (await fallback));

  if (!row || !passwordMatches) {
    return { ok: false, message: "Неверный логин или пароль" };
  }

  const now = options.now ?? new Date();
  db.prepare("UPDATE users SET last_login_at = ?, updated_at = ? WHERE id = ?").run(
    now.toISOString(),
    now.toISOString(),
    row.id,
  );
  const user: AuthUser = { id: row.id, username: row.username, role: row.role };
  const token = createSession(row.id, {
    db,
    now,
    ipHash: options.ipHash,
    userAgent: options.userAgent,
  });
  return { ok: true, user, token };
}

function authDatabase(): Database {
  const db = openDatabase();
  runMigrations(db);
  return db;
}
