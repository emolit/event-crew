import type { ContactPayload } from "@/lib/contact-schema";

const DEFAULT_TIMEOUT_MS = 8_000;

export interface TelegramConfig {
  token: string;
  chatId: string;
  timeoutMs?: number;
}

export function formatApplicationTelegram(payload: ContactPayload): string {
  return [
    "🟡 НОВАЯ ЗАЯВКА EVENT CREW",
    "",
    `Имя: ${display(payload.name)}`,
    `Телефон: ${display(payload.phone)}`,
    `Telegram: ${display(payload.telegram)}`,
    `Дата: ${formatEventPeriod(payload.eventStartDate, payload.eventEndDate)}`,
    `Персонал: ${display(payload.staffTypes.join(", "))}`,
    `Количество: ${display(payload.quantity)}`,
    "",
    "Комментарий:",
    display(payload.comment),
  ].join("\n");
}

export async function sendApplicationTelegram(
  payload: ContactPayload,
  config: TelegramConfig,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await fetchImpl(
      `https://api.telegram.org/bot${config.token}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: formatApplicationTelegram(payload),
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error("TELEGRAM_DELIVERY_FAILED");
    }

    const result = await response.json() as { ok?: unknown };
    if (result.ok !== true) {
      throw new Error("TELEGRAM_DELIVERY_FAILED");
    }
  } catch {
    throw new Error("TELEGRAM_DELIVERY_FAILED");
  } finally {
    clearTimeout(timeout);
  }
}

function display(value: string | number | undefined): string {
  return value === undefined || String(value).trim() === "" ? "—" : String(value);
}

function formatEventPeriod(startDate: string, endDate: string): string {
  if (!startDate) {
    return "—";
  }

  const start = formatIsoDate(startDate);
  return endDate && endDate !== startDate
    ? `${start} — ${formatIsoDate(endDate)}`
    : `${start} (1 день)`;
}

function formatIsoDate(value: string): string {
  const [year, month, day] = value.split("-");
  return `${day}.${month}.${year}`;
}
