import { describe, expect, test, vi } from "vitest";
import {
  formatApplicationTelegram,
  sendApplicationTelegram,
} from "@/lib/telegram";

const payload = {
  name: "Иван <script>\nПетров",
  phone: "+7 999 123-45-67",
  telegram: "@ivan_test",
  eventStartDate: "2026-09-25",
  eventEndDate: "2026-09-27",
  staffTypes: ["Хостес", "Официанты"],
  quantity: 10,
  comment: "Регистрация & встреча гостей\nВторой этаж",
  website: "",
};

describe("application Telegram message", () => {
  test("formats a readable date-range application and keeps user text literal", () => {
    expect(formatApplicationTelegram(payload)).toBe(
      [
        "🟡 НОВАЯ ЗАЯВКА EVENT CREW",
        "",
        "Имя: Иван <script>\nПетров",
        "Телефон: +7 999 123-45-67",
        "Telegram: @ivan_test",
        "Дата: 25.09.2026 — 27.09.2026",
        "Персонал: Хостес, Официанты",
        "Количество: 10",
        "",
        "Комментарий:",
        "Регистрация & встреча гостей\nВторой этаж",
      ].join("\n"),
    );
  });

  test("marks one-day events and missing optional values", () => {
    const message = formatApplicationTelegram({
      ...payload,
      telegram: "",
      eventEndDate: "",
      staffTypes: [],
      quantity: undefined,
      comment: "",
    });

    expect(message).toContain("Telegram: —");
    expect(message).toContain("Дата: 25.09.2026 (1 день)");
    expect(message).toContain("Персонал: —");
    expect(message).toContain("Количество: —");
    expect(message).toContain("Комментарий:\n—");
  });

  test("shows a missing event period as optional", () => {
    const message = formatApplicationTelegram({
      ...payload,
      eventStartDate: "",
      eventEndDate: "",
    });

    expect(message).toContain("Дата: —");
  });
});

describe("Telegram delivery", () => {
  test("posts plain JSON to sendMessage while preserving a negative group chat id", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await sendApplicationTelegram(
      payload,
      { token: "bot-secret", chatId: "-1001234567890" },
      fetchMock,
    );

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.telegram.org/botbot-secret/sendMessage");
    expect(init).toMatchObject({
      method: "POST",
      headers: { "content-type": "application/json" },
    });
    expect(JSON.parse(String(init?.body))).toEqual({
      chat_id: "-1001234567890",
      text: formatApplicationTelegram(payload),
    });
    expect(JSON.parse(String(init?.body))).not.toHaveProperty("parse_mode");
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  test.each([
    ["an HTTP error", new Response("Bad Gateway", { status: 502 })],
    [
      "an API-level error",
      new Response(JSON.stringify({ ok: false, error_code: 400, description: "Bad Request" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    ],
    ["malformed JSON", new Response("not-json", { status: 200 })],
  ])("rejects %s without exposing the upstream response", async (_label, response) => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(response);

    await expect(
      sendApplicationTelegram(
        payload,
        { token: "bot-secret", chatId: "-1001234567890" },
        fetchMock,
      ),
    ).rejects.toThrow("TELEGRAM_DELIVERY_FAILED");
  });

  test("normalizes network failures", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockRejectedValue(new Error("connect ETIMEDOUT bot-secret"));

    await expect(
      sendApplicationTelegram(
        payload,
        { token: "bot-secret", chatId: "-1001234567890" },
        fetchMock,
      ),
    ).rejects.toThrow("TELEGRAM_DELIVERY_FAILED");
  });

  test("aborts a delivery that exceeds the configured timeout", async () => {
    const fetchMock = vi.fn<typeof fetch>().mockImplementation((_url, init) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
      }),
    );

    await expect(
      sendApplicationTelegram(
        payload,
        { token: "bot-secret", chatId: "-1001234567890", timeoutMs: 5 },
        fetchMock,
      ),
    ).rejects.toThrow("TELEGRAM_DELIVERY_FAILED");
  });
});
