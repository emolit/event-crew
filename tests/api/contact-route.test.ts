import { sendApplicationTelegram } from "@/lib/telegram";
import { sendApplicationRelay } from "@/lib/contact-relay";
import { POST } from "@/app/api/contact/route";
import { contactRateLimiter } from "@/lib/rate-limit";

vi.mock("@/lib/telegram", () => ({
  sendApplicationTelegram: vi.fn(),
}));
vi.mock("@/lib/contact-relay", () => ({
  sendApplicationRelay: vi.fn(),
}));

const sendApplicationTelegramMock = vi.mocked(sendApplicationTelegram);
const sendApplicationRelayMock = vi.mocked(sendApplicationRelay);

const payload = {
  name: "Иван",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventStartDate: "2026-09-25",
  eventEndDate: "2026-09-27",
  staffTypes: ["Хостес", "Официанты"],
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
  process.env.TELEGRAM_BOT_TOKEN = "bot-secret";
  process.env.TELEGRAM_CHAT_ID = "-1001234567890";
  process.env.CONTACT_RELAY_SECRET = "relay-secret";
  delete process.env.CONTACT_RELAY_URL;
  sendApplicationTelegramMock.mockResolvedValue(undefined);
  sendApplicationRelayMock.mockResolvedValue(undefined);
});

afterEach(() => {
  process.env = { ...originalEnv };
  sendApplicationTelegramMock.mockReset();
  sendApplicationRelayMock.mockReset();
});

it("returns 200 and sends a valid request", async () => {
  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
  expect(sendApplicationTelegramMock).toHaveBeenCalledWith(
    { ...payload, quantity: 10 },
    {
      token: "bot-secret",
      chatId: "-1001234567890",
    },
  );
  expect(sendApplicationRelayMock).not.toHaveBeenCalled();
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
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
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
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();

  const sameOriginResponse = await POST(
    createRequest(JSON.stringify(payload), { headers: { origin: "http://localhost" } }),
  );
  expect(sameOriginResponse.status).toBe(200);
});

it("accepts the configured public origin when nginx exposes an internal request URL", async () => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://eventcrw.com";

  const response = await POST(
    createRequest(JSON.stringify(payload), {
      headers: { origin: "https://eventcrw.com" },
      url: "http://127.0.0.1:3000/api/contact",
    }),
  );

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
});

it("keeps rejecting foreign origins and falls back safely when the configured URL is invalid", async () => {
  process.env.NEXT_PUBLIC_SITE_URL = "not-a-url";

  const foreignResponse = await POST(
    createRequest(JSON.stringify(payload), { headers: { origin: "https://attacker.example" } }),
  );
  expect(foreignResponse.status).toBe(403);

  const localResponse = await POST(
    createRequest(JSON.stringify(payload), { headers: { origin: "http://localhost" } }),
  );
  expect(localResponse.status).toBe(200);
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
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
});

it("returns 413 when the body exceeds 16 KiB without a Content-Length header", async () => {
  const response = await POST(createRequest(`"${"x".repeat(16_385)}"`));

  expect(response.status).toBe(413);
  await expect(response.json()).resolves.toEqual({
    ok: false,
    error: "PAYLOAD_TOO_LARGE",
  });
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
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
  expect(sendApplicationTelegramMock).toHaveBeenCalledTimes(5);
});

it("returns 400 for malformed JSON", async () => {
  const response = await POST(createRequest("{"));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "VALIDATION_ERROR" });
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
});

it("returns 400 for invalid fields without sending to Telegram", async () => {
  const response = await POST(createRequest(JSON.stringify({ ...payload, name: "" })));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "VALIDATION_ERROR" });
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
});

it.each(["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"])(
  "returns 500 when %s is absent",
  async (variable) => {
    delete process.env[variable];

    const response = await POST(createRequest(JSON.stringify(payload)));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ ok: false, error: "CONFIGURATION_ERROR" });
    expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
  },
);

it("returns 502 when Telegram delivery fails or times out", async () => {
  sendApplicationTelegramMock.mockRejectedValue(new Error("TELEGRAM_DELIVERY_FAILED"));

  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(502);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "DELIVERY_ERROR" });
});

it("uses the configured relay instead of direct Telegram delivery", async () => {
  process.env.CONTACT_RELAY_URL = "https://relay.example/api/contact/relay";

  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
  expect(sendApplicationRelayMock).toHaveBeenCalledWith(
    { ...payload, quantity: 10 },
    {
      url: "https://relay.example/api/contact/relay",
      secret: "relay-secret",
    },
  );
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
});

it("returns a configuration error when relay URL exists without a secret", async () => {
  process.env.CONTACT_RELAY_URL = "https://relay.example/api/contact/relay";
  delete process.env.CONTACT_RELAY_SECRET;

  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "CONFIGURATION_ERROR" });
  expect(sendApplicationRelayMock).not.toHaveBeenCalled();
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
});

it("returns 502 when relay delivery fails or times out", async () => {
  process.env.CONTACT_RELAY_URL = "https://relay.example/api/contact/relay";
  sendApplicationRelayMock.mockRejectedValue(new Error("RELAY_DELIVERY_FAILED relay-secret"));

  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(502);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "DELIVERY_ERROR" });
});
