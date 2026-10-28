import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { AdminConfig } from "@/lib/admin/config";
import { getAdminConfig } from "@/lib/admin/config";
import type { Database } from "@/lib/db/client";
import { openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

export const SESSION_COOKIE_NAME = "eventcrew_admin";
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

export interface AuthUser {
  id: number;
  username: string;
  role: "owner" | "editor";
}

interface SessionOptions {
  db?: Database;
  now?: Date;
  ipHash?: string | null;
  userAgent?: string | null;
}

export function createSession(userId: number, options: SessionOptions = {}): string {
  const db = options.db ?? authDatabase();
  const now = options.now ?? new Date();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1_000).toISOString();

  db.prepare(
    `INSERT INTO sessions (token_hash, user_id, expires_at, created_at, ip_hash, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    hashToken(token),
    userId,
    expiresAt,
    now.toISOString(),
    options.ipHash ?? null,
    options.userAgent ?? null,
  );
  return token;
}

export function getSessionUserByToken(token: string, options: SessionOptions = {}): AuthUser | null {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return null;
  }

  const db = options.db ?? authDatabase();
  const now = (options.now ?? new Date()).toISOString();
  const row = db
    .prepare(
      `SELECT users.id, users.username, users.role
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token_hash = ?
         AND sessions.revoked_at IS NULL
         AND sessions.expires_at > ?
         AND users.is_active = 1`,
    )
    .get(hashToken(token), now) as AuthUser | undefined;

  return row ?? null;
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return token ? getSessionUserByToken(token) : null;
}

export function revokeSession(token: string, options: Pick<SessionOptions, "db"> = {}): void {
  if (!/^[a-f0-9]{64}$/.test(token)) {
    return;
  }
  const db = options.db ?? authDatabase();
  db.prepare("UPDATE sessions SET revoked_at = CURRENT_TIMESTAMP WHERE token_hash = ?").run(
    hashToken(token),
  );
}

export function sessionCookieOptions(config: AdminConfig = getAdminConfig()) {
  return {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

export function buildSessionCookie(token: string, secure: boolean) {
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    options: sessionCookieOptions({ ...getAdminConfig(), isProduction: secure }),
  };
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function authDatabase(): Database {
  const db = openDatabase();
  runMigrations(db);
  return db;
}
