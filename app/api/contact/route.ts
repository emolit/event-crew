import { contactSchema } from "@/lib/contact-schema";
import { sendTelegramMessage } from "@/lib/telegram";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
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
