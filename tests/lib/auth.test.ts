// @vitest-environment node

import { createHash } from "node:crypto";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";
import { getAdminConfig } from "@/lib/admin/config";
import { AuthRequiredError, assertAdmin } from "@/lib/auth/guard";
import { authenticateCredentials } from "@/lib/auth/login";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { LoginRateLimiter } from "@/lib/auth/rate-limit";
import {
  createSession,
  getSessionUserByToken,
  revokeSession,
  sessionCookieOptions,
} from "@/lib/auth/session";
import { closeDatabaseForTests, openDatabase } from "@/lib/db/client";
import { runMigrations } from "@/lib/db/migrate";

afterEach(() => {
  closeDatabaseForTests();
});

function testDatabase() {
  const dataDir = mkdtempSync(join(tmpdir(), "event-crew-auth-"));
  const config = getAdminConfig({
    NODE_ENV: "test",
    EVENT_CREW_DATA_DIR: dataDir,
    SESSION_SECRET: "d".repeat(64),
  });
  const db = openDatabase(config);
  runMigrations(db);
  return { db, config };
}

describe("password hashing", () => {
  test("verifies the right password and rejects a different one", async () => {
    const encoded = await hashPassword("correct horse battery staple");

    await expect(verifyPassword("correct horse battery staple", encoded)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", encoded)).resolves.toBe(false);
    expect(encoded).not.toContain("correct horse battery staple");
  });

  test("rejects malformed password hashes without throwing", async () => {
    await expect(verifyPassword("anything", "not-a-scrypt-hash")).resolves.toBe(false);
  });
});

describe("sessions", () => {
  test("stores only a hash of the opaque token and sets secure production cookie flags", async () => {
    const { db, config } = testDatabase();
    const passwordHash = await hashPassword("owner password 123");
    const userId = Number(
      db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run("ivan", passwordHash)
        .lastInsertRowid,
    );

    const token = createSession(userId, { db, now: new Date("2026-10-28T10:00:00.000Z") });
    const stored = db.prepare("SELECT token_hash FROM sessions").get() as { token_hash: string };

    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(stored.token_hash).toBe(createHash("sha256").update(token).digest("hex"));
    expect(stored.token_hash).not.toBe(token);
    expect(sessionCookieOptions({ ...config, isProduction: true })).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 43_200,
    });
  });

  test("rejects expired and revoked sessions", async () => {
    const { db } = testDatabase();
    const passwordHash = await hashPassword("owner password 123");
    const userId = Number(
      db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run("ivan", passwordHash)
        .lastInsertRowid,
    );
    const token = createSession(userId, { db, now: new Date("2026-10-28T10:00:00.000Z") });

    expect(
      getSessionUserByToken(token, { db, now: new Date("2026-10-28T11:00:00.000Z") }),
    ).toMatchObject({ id: userId, username: "ivan", role: "owner" });
    expect(
      getSessionUserByToken(token, { db, now: new Date("2026-10-29T00:00:01.000Z") }),
    ).toBeNull();

    revokeSession(token, { db });
    expect(
      getSessionUserByToken(token, { db, now: new Date("2026-10-28T11:00:00.000Z") }),
    ).toBeNull();
  });
});

describe("login protection", () => {
  test("returns the same public error for an unknown user and a wrong password", async () => {
    const { db } = testDatabase();
    const passwordHash = await hashPassword("owner password 123");
    db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run("ivan", passwordHash);

    const unknown = await authenticateCredentials("nobody", "wrong password", { db });
    const wrong = await authenticateCredentials("ivan", "wrong password", { db });

    expect(unknown).toEqual({ ok: false, message: "Неверный логин или пароль" });
    expect(wrong).toEqual(unknown);
  });

  test("throttles the sixth failed attempt inside fifteen minutes", () => {
    const limiter = new LoginRateLimiter({ maxAttempts: 5, windowMs: 15 * 60_000 });
    const startedAt = 1_798_300_000_000;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(limiter.consume("127.0.0.1:ivan", startedAt + attempt)).toBe(true);
    }
    expect(limiter.consume("127.0.0.1:ivan", startedAt + 5)).toBe(false);
    expect(limiter.consume("127.0.0.1:ivan", startedAt + 15 * 60_000 + 1)).toBe(true);
  });

  test("throws the dedicated authorization error when no owner is present", () => {
    expect(() => assertAdmin(null)).toThrow(AuthRequiredError);
  });
});
