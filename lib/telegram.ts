import type { ContactPayload } from "@/lib/contact-schema";

export type TelegramEnv = {
  botToken: string;
  chatId: string;
};

const emptyValue = "—";

export function escapeTelegramHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatValue(value: string | number | undefined): string {
  if (value === "" || value === undefined) {
    return emptyValue;
  }

  return escapeTelegramHtml(String(value));
}

export function formatTelegramMessage(payload: ContactPayload): string {
  return [
    "🔔 Новая заявка с сайта",
    "",
    `<b>Имя:</b> ${formatValue(payload.name)}`,
    `<b>Телефон:</b> ${formatValue(payload.phone)}`,
    `<b>Telegram:</b> ${formatValue(payload.telegram)}`,
    `<b>Дата мероприятия:</b> ${formatValue(payload.eventDate)}`,
    `<b>Тип персонала:</b> ${formatValue(payload.staffType)}`,
    `<b>Количество:</b> ${formatValue(payload.quantity)}`,
    `<b>Комментарий:</b> ${formatValue(payload.comment)}`,
  ].join("\n");
}

export async function sendTelegramMessage(
  payload: ContactPayload,
  env: TelegramEnv,
  fetcher: typeof fetch = fetch,
): Promise<void> {
  let response: Response;

  try {
    response = await fetcher(`https://api.telegram.org/bot${env.botToken}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: env.chatId,
        parse_mode: "HTML",
        text: formatTelegramMessage(payload),
      }),
    });
  } catch {
    throw new Error("TELEGRAM_DELIVERY_FAILED");
  }

  if (!response.ok) {
    throw new Error("TELEGRAM_DELIVERY_FAILED");
  }

  let result: { ok?: boolean };

  try {
    result = (await response.json()) as { ok?: boolean };
  } catch {
    throw new Error("TELEGRAM_DELIVERY_FAILED");
  }

  if (result.ok !== true) {
    throw new Error("TELEGRAM_DELIVERY_FAILED");
  }
}
