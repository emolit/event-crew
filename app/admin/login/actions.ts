"use server";

import { createHash } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminConfig } from "@/lib/admin/config";
import { authenticateCredentials } from "@/lib/auth/login";
import { loginAccountRateLimiter, loginIpRateLimiter } from "@/lib/auth/rate-limit";
import { buildSessionCookie } from "@/lib/auth/session";

export interface LoginState {
  message: string | null;
}

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const requestHeaders = await headers();
  if (!isAllowedOrigin(requestHeaders)) {
    return { message: "Не удалось выполнить вход" };
  }

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) {
    return { message: "Введите логин и пароль" };
  }

  const clientIp = requestHeaders.get("x-real-ip")?.trim() || "unknown";
  const accountKey = username.toLocaleLowerCase("ru");
  if (!loginIpRateLimiter.consume(clientIp) || !loginAccountRateLimiter.consume(accountKey)) {
    return { message: "Слишком много попыток. Попробуйте через 15 минут" };
  }

  const result = await authenticateCredentials(username, password, {
    ipHash: createHash("sha256").update(clientIp).digest("hex"),
    userAgent: requestHeaders.get("user-agent"),
  });
  if (!result.ok) {
    return { message: result.message };
  }

  loginAccountRateLimiter.reset(accountKey);
  const config = getAdminConfig();
  const sessionCookie = buildSessionCookie(result.token, config.isProduction);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
  redirect("/admin");
}

function isAllowedOrigin(requestHeaders: Awaited<ReturnType<typeof headers>>): boolean {
  const origin = requestHeaders.get("origin");
  if (!origin) {
    return true;
  }
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  if (!host) {
    return false;
  }
  try {
    return new URL(origin).origin === `${protocol}://${host}`;
  } catch {
    return false;
  }
}
