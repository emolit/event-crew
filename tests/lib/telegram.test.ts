import { formatTelegramMessage, sendTelegramMessage } from "@/lib/telegram";
import type { ContactPayload } from "@/lib/contact-schema";

const payload: ContactPayload = {
  name: "Иван",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventStartDate: "2026-09-25",
  eventEndDate: "2026-09-27",
  staffTypes: ["Хостес", "Официанты"],
  quantity: 10,
  comment: "Регистрация гостей",
  website: "",
};

it("formats every populated contact field", () => {
  const message = formatTelegramMessage(payload);

  expect(message.startsWith("🔔 Новая заявка с сайта")).toBe(true);
  expect(message).toContain("<b>Имя:</b> Иван");
  expect(message).toContain("<b>Телефон:</b> +7 999 123-45-67");
  expect(message).toContain("<b>Telegram:</b> @ivan");
  expect(message).toContain("<b>Период мероприятия:</b> 2026-09-25 — 2026-09-27");
  expect(message).toContain("<b>Виды персонала:</b> Хостес, Официанты");
  expect(message).toContain("<b>Количество:</b> 10");
  expect(message).toContain("<b>Комментарий:</b> Регистрация гостей");
});

it("renders empty optional contact fields as an em dash", () => {
  const message = formatTelegramMessage({
    ...payload,
    telegram: "",
    eventStartDate: "",
    eventEndDate: "",
    staffTypes: [],
    quantity: undefined,
    comment: "",
  });

  expect(message).toContain("<b>Telegram:</b> —");
  expect(message).toContain("<b>Период мероприятия:</b> —");
  expect(message).toContain("<b>Виды персонала:</b> —");
  expect(message).toContain("<b>Количество:</b> —");
  expect(message).toContain("<b>Комментарий:</b> —");
});

it("escapes contact values for Telegram HTML mode", () => {
  const message = formatTelegramMessage({
    ...payload,
    name: "<Иван & Партнёры>",
  });

  expect(message).toContain("<b>Имя:</b> &lt;Иван &amp; Партнёры&gt;");
});

it("sends the formatted message through the Telegram API", async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), { status: 200 }),
  );

  await sendTelegramMessage(payload, { botToken: "TOKEN", chatId: "CHAT" }, fetcher);

  expect(fetcher).toHaveBeenCalledWith("https://api.telegram.org/botTOKEN/sendMessage", {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: expect.any(AbortSignal),
    body: JSON.stringify({
      chat_id: "CHAT",
      parse_mode: "HTML",
      text: formatTelegramMessage(payload),
    }),
  });
});

it("rejects a Telegram error response without exposing sensitive details", async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ ok: false, description: "bot TOKEN is invalid" }), { status: 200 }),
  );

  await expect(
    sendTelegramMessage(payload, { botToken: "TOKEN", chatId: "CHAT" }, fetcher),
  ).rejects.toThrow("TELEGRAM_DELIVERY_FAILED");
});

it("rejects a non-success HTTP status without exposing sensitive details", async () => {
  const fetcher = vi.fn().mockResolvedValue(
    new Response("bot TOKEN is invalid", { status: 500 }),
  );

  await expect(
    sendTelegramMessage(payload, { botToken: "TOKEN", chatId: "CHAT" }, fetcher),
  ).rejects.toThrow("TELEGRAM_DELIVERY_FAILED");
});

it("normalizes fetch failures without exposing the request URL", async () => {
  const fetcher = vi.fn().mockRejectedValue(
    new Error("Request to https://api.telegram.org/botTOKEN/sendMessage failed"),
  );

  await expect(
    sendTelegramMessage(payload, { botToken: "TOKEN", chatId: "CHAT" }, fetcher),
  ).rejects.toThrow(/^TELEGRAM_DELIVERY_FAILED$/);
});

it("aborts Telegram delivery after ten seconds and normalizes the timeout", async () => {
  vi.useFakeTimers();
  let observedSignal: AbortSignal | undefined;
  const fetcher = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    observedSignal = init?.signal ?? undefined;

    if (!observedSignal) {
      return Promise.reject(new Error("MISSING_ABORT_SIGNAL"));
    }

    return new Promise<Response>((_resolve, reject) => {
      observedSignal?.addEventListener(
        "abort",
        () => reject(new DOMException("The request was aborted", "AbortError")),
        { once: true },
      );
    });
  }) as typeof fetch;

  try {
    const delivery = sendTelegramMessage(
      payload,
      { botToken: "TOKEN", chatId: "CHAT" },
      fetcher,
    );
    const rejection = expect(delivery).rejects.toThrow(/^TELEGRAM_DELIVERY_FAILED$/);

    await vi.advanceTimersByTimeAsync(10_000);
    await rejection;
    expect(observedSignal?.aborted).toBe(true);
  } finally {
    vi.useRealTimers();
  }
});
