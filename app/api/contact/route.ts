import { contactSchema } from "@/lib/contact-schema";
import { contactRateLimiter } from "@/lib/rate-limit";
import { sendApplicationEmail } from "@/lib/email";

export const runtime = "nodejs";

const MAX_BODY_LENGTH = 16 * 1_024;

export async function POST(request: Request): Promise<Response> {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    return Response.json(
      { ok: false, error: "UNSUPPORTED_MEDIA_TYPE" },
      { status: 415 },
    );
  }

  const origin = request.headers.get("origin");
  if (origin && !isAllowedOrigin(origin, request.url, process.env.NEXT_PUBLIC_SITE_URL)) {
    return Response.json({ ok: false, error: "ORIGIN_NOT_ALLOWED" }, { status: 403 });
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_BODY_LENGTH) {
    return payloadTooLargeResponse();
  }

  if (!contactRateLimiter.allow(getClientKey(request))) {
    return Response.json({ ok: false, error: "RATE_LIMITED" }, { status: 429 });
  }

  let bodyText: string;
  let body: unknown;

  try {
    bodyText = await request.text();
  } catch {
    return Response.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 });
  }

  if (bodyText.length > MAX_BODY_LENGTH) {
    return payloadTooLargeResponse();
  }

  try {
    body = JSON.parse(bodyText) as unknown;
  } catch {
    return Response.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 });
  }

  const host = process.env.SMTP_HOST?.trim() || "smtp.mail.ru";
  const port = Number(process.env.SMTP_PORT?.trim() || "465");
  const secure = (process.env.SMTP_SECURE?.trim() || "true").toLowerCase() === "true";
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASSWORD;
  const recipient = process.env.CONTACT_RECIPIENT_EMAIL?.trim() || user;

  if (!user || !password || !recipient || !Number.isInteger(port) || port < 1 || port > 65_535) {
    return Response.json({ ok: false, error: "CONFIGURATION_ERROR" }, { status: 500 });
  }

  try {
    await sendApplicationEmail(parsed.data, { host, port, secure, user, password, recipient });
  } catch {
    return Response.json({ ok: false, error: "DELIVERY_ERROR" }, { status: 502 });
  }

  return Response.json({ ok: true });
}

function isAllowedOrigin(origin: string, requestUrl: string, configuredSiteUrl?: string): boolean {
  try {
    const requestOrigin = new URL(requestUrl).origin;
    const submittedOrigin = new URL(origin).origin;
    if (submittedOrigin === requestOrigin) {
      return true;
    }

    if (!configuredSiteUrl) {
      return false;
    }

    try {
      return submittedOrigin === new URL(configuredSiteUrl).origin;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

function payloadTooLargeResponse(): Response {
  return Response.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
}

function getClientKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",", 1)[0].trim() || "unknown";
}
