import { sendTelegramMessage } from "@/lib/telegram";
import { POST } from "@/app/api/contact/route";
import { contactRateLimiter } from "@/lib/rate-limit";

vi.mock("@/lib/telegram", () => ({
  sendTelegramMessage: vi.fn(),
}));

const sendTelegramMessageMock = vi.mocked(sendTelegramMessage);

const payload = {
  name: "Иван",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventDate: "2026-09-25",
  staffType: "Хостес",
  quantity: "10",
  comment: "Регистрация гостей",
  website: "",
};

const originalEnv = { ...process.env };

function createRequest(
  body: string,
  options: { headers?: Record<string, string>; url?: string } = {},
): Request {
  return new Request(options.url ?? "http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", ...options.headers },
    body,
  });
}

beforeEach(() => {
  contactRateLimiter.clear();
  process.env.TELEGRAM_BOT_TOKEN = "bot-token";
  process.env.TELEGRAM_CHAT_ID = "chat-id";
  sendTelegramMessageMock.mockResolvedValue(undefined);
});

afterEach(() => {
  process.env = { ...originalEnv };
  sendTelegramMessageMock.mockReset();
});

it("returns 200 and sends a valid request", async () => {
  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
  expect(sendTelegramMessageMock).toHaveBeenCalledWith(
    { ...payload, quantity: 10 },
    { botToken: "bot-token", chatId: "chat-id" },
  );
});

it("returns 415 unless the request media type is application/json", async () => {
  const response = await POST(
    createRequest(JSON.stringify(payload), { headers: { "content-type": "text/plain" } }),
  );

  expect(response.status).toBe(415);
  await expect(response.json()).resolves.toEqual({
    ok: false,
    error: "UNSUPPORTED_MEDIA_TYPE",
  });
  expect(sendTelegramMessageMock).not.toHaveBeenCalled();
});

it("rejects cross-origin browser requests and accepts a matching Origin", async () => {
  const crossOriginResponse = await POST(
    createRequest(JSON.stringify(payload), { headers: { origin: "https://attacker.example" } }),
  );

  expect(crossOriginResponse.status).toBe(403);
  await expect(crossOriginResponse.json()).resolves.toEqual({
    ok: false,
    error: "ORIGIN_NOT_ALLOWED",
  });
  expect(sendTelegramMessageMock).not.toHaveBeenCalled();

  const sameOriginResponse = await POST(
    createRequest(JSON.stringify(payload), { headers: { origin: "http://localhost" } }),
  );
  expect(sameOriginResponse.status).toBe(200);
});

it("returns 413 before reading a declared body larger than 16 KiB", async () => {
  const response = await POST(
    createRequest(JSON.stringify(payload), { headers: { "content-length": "16385" } }),
  );

  expect(response.status).toBe(413);
  await expect(response.json()).resolves.toEqual({
    ok: false,
    error: "PAYLOAD_TOO_LARGE",
  });
  expect(sendTelegramMessageMock).not.toHaveBeenCalled();
});

it("returns 413 when the body exceeds 16 KiB without a Content-Length header", async () => {
  const response = await POST(createRequest(`"${"x".repeat(16_385)}"`));

  expect(response.status).toBe(413);
  await expect(response.json()).resolves.toEqual({
    ok: false,
    error: "PAYLOAD_TOO_LARGE",
  });
  expect(sendTelegramMessageMock).not.toHaveBeenCalled();
});

it("allows five attempts per ten-minute window using the first forwarded IP", async () => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const response = await POST(
      createRequest(JSON.stringify(payload), {
        headers: { "x-forwarded-for": `203.0.113.77, 198.51.100.${attempt}` },
      }),
    );
    expect(response.status).toBe(200);
  }

  const blockedResponse = await POST(
    createRequest(JSON.stringify(payload), {
      headers: { "x-forwarded-for": "203.0.113.77, 192.0.2.99" },
    }),
  );

  expect(blockedResponse.status).toBe(429);
  await expect(blockedResponse.json()).resolves.toEqual({
    ok: false,
    error: "RATE_LIMITED",
  });
  expect(sendTelegramMessageMock).toHaveBeenCalledTimes(5);
});

it("returns 400 for malformed JSON", async () => {
  const response = await POST(createRequest("{"));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "VALIDATION_ERROR" });
  expect(sendTelegramMessageMock).not.toHaveBeenCalled();
});

it("returns 400 for invalid fields without calling Telegram", async () => {
  const response = await POST(createRequest(JSON.stringify({ ...payload, name: "" })));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "VALIDATION_ERROR" });
  expect(sendTelegramMessageMock).not.toHaveBeenCalled();
});

it("returns 500 when Telegram environment variables are absent", async () => {
  delete process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_CHAT_ID;

  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "CONFIGURATION_ERROR" });
  expect(sendTelegramMessageMock).not.toHaveBeenCalled();
});

it("returns 502 when Telegram delivery fails", async () => {
  sendTelegramMessageMock.mockRejectedValue(new Error("TELEGRAM_DELIVERY_FAILED"));

  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(502);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "DELIVERY_ERROR" });
});
