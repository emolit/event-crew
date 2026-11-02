import { createHash, timingSafeEqual } from "node:crypto";
import { contactSchema } from "@/lib/contact-schema";
import { sendApplicationTelegram } from "@/lib/telegram";

export const runtime = "nodejs";

const MAX_BODY_LENGTH = 16 * 1_024;
const relayContactSchema = contactSchema.strict();

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.CONTACT_RELAY_SECRET?.trim();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!secret || !token || !chatId) {
    return Response.json({ ok: false, error: "CONFIGURATION_ERROR" }, { status: 500 });
  }

  if (!isAuthorized(request.headers.get("authorization"), secret)) {
    return Response.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    return Response.json(
      { ok: false, error: "UNSUPPORTED_MEDIA_TYPE" },
      { status: 415 },
    );
  }

  const declaredLength = request.headers.get("content-length");
  if (declaredLength && /^\d+$/.test(declaredLength) && Number(declaredLength) > MAX_BODY_LENGTH) {
    return payloadTooLargeResponse();
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

  const parsed = relayContactSchema.safeParse(restoreContactSchemaInput(body));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "VALIDATION_ERROR" }, { status: 400 });
  }

  try {
    await sendApplicationTelegram(parsed.data, { token, chatId });
  } catch {
    return Response.json({ ok: false, error: "DELIVERY_ERROR" }, { status: 502 });
  }

  return Response.json({ ok: true });
}

function isAuthorized(header: string | null, expectedSecret: string): boolean {
  if (!header?.startsWith("Bearer ")) {
    return false;
  }

  const suppliedSecret = header.slice("Bearer ".length);
  const expectedDigest = createHash("sha256").update(expectedSecret).digest();
  const suppliedDigest = createHash("sha256").update(suppliedSecret).digest();

  return timingSafeEqual(expectedDigest, suppliedDigest);
}

function restoreContactSchemaInput(body: unknown): unknown {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return body;
  }

  const record = body as Record<string, unknown>;
  const quantity = record.quantity;

  if (!("quantity" in record)) {
    return { ...record, quantity: "" };
  }

  return typeof quantity === "number"
    ? { ...record, quantity: String(quantity) }
    : body;
}

function payloadTooLargeResponse(): Response {
  return Response.json({ ok: false, error: "PAYLOAD_TOO_LARGE" }, { status: 413 });
}
