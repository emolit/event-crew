import { contactSchema } from "@/lib/contact-schema";
import { contactRateLimiter } from "@/lib/rate-limit";
import { sendTelegramMessage } from "@/lib/telegram";

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
  if (origin && !isSameOrigin(origin, request.url)) {
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

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return Response.json({ ok: false, error: "CONFIGURATION_ERROR" }, { status: 500 });
  }

  try {
    await sendTelegramMessage(parsed.data, { botToken, chatId });
  } catch {
    return Response.json({ ok: false, error: "DELIVERY_ERROR" }, { status: 502 });
  }

  return Response.json({ ok: true });
}

function isSameOrigin(origin: string, requestUrl: string): boolean {
  try {
    return new URL(origin).origin === new URL(requestUrl).origin;
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
