import { sendApplicationTelegram } from "@/lib/telegram";
import { POST } from "@/app/api/contact/relay/route";

vi.mock("@/lib/telegram", () => ({
  sendApplicationTelegram: vi.fn(),
}));

const sendApplicationTelegramMock = vi.mocked(sendApplicationTelegram);
const originalEnv = { ...process.env };

const payload = {
  name: "Иван",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventStartDate: "2026-11-10",
  eventEndDate: "",
  staffTypes: ["Хелперы", "Официанты"],
  quantity: 2,
  comment: "Тестовая заявка",
  website: "",
};

function createRequest(
  body: string,
  options: { headers?: Record<string, string> } = {},
): Request {
  return new Request("https://relay.example/api/contact/relay", {
    method: "POST",
    headers: {
      authorization: "Bearer relay-secret",
      "content-type": "application/json",
      ...options.headers,
    },
    body,
  });
}

beforeEach(() => {
  process.env.CONTACT_RELAY_SECRET = "relay-secret";
  process.env.TELEGRAM_BOT_TOKEN = "bot-secret";
  process.env.TELEGRAM_CHAT_ID = "-1001234567890";
  sendApplicationTelegramMock.mockResolvedValue(undefined);
});

afterEach(() => {
  process.env = { ...originalEnv };
  sendApplicationTelegramMock.mockReset();
});

it("accepts an authorized normalized application and sends it to Telegram", async () => {
  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ok: true });
  expect(sendApplicationTelegramMock).toHaveBeenCalledWith(payload, {
    token: "bot-secret",
    chatId: "-1001234567890",
  });
});

it.each([
  ["missing", ""],
  ["wrong scheme", "Basic relay-secret"],
  ["missing value", "Bearer"],
  ["wrong value", "Bearer wrong-secret"],
])("returns 401 for a %s authorization header", async (_label, authorization) => {
  const response = await POST(
    createRequest(JSON.stringify(payload), { headers: { authorization } }),
  );

  expect(response.status).toBe(401);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "UNAUTHORIZED" });
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
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

it("returns 413 before reading a declared body larger than 16 KiB", async () => {
  const response = await POST(
    createRequest(JSON.stringify(payload), { headers: { "content-length": "16385" } }),
  );

  expect(response.status).toBe(413);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "PAYLOAD_TOO_LARGE" });
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
});

it("returns 413 when the actual body exceeds 16 KiB", async () => {
  const response = await POST(createRequest(`"${"x".repeat(16_385)}"`));

  expect(response.status).toBe(413);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "PAYLOAD_TOO_LARGE" });
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
});

it.each([
  ["malformed JSON", "{"],
  ["an invalid contact payload", JSON.stringify({ ...payload, phone: "123" })],
  ["an unexpected contact field", JSON.stringify({ ...payload, privileged: true })],
])("returns 400 for %s", async (_label, body) => {
  const response = await POST(createRequest(body));

  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "VALIDATION_ERROR" });
  expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
});

it.each(["CONTACT_RELAY_SECRET", "TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"])(
  "returns 500 when %s is missing",
  async (variable) => {
    delete process.env[variable];

    const response = await POST(createRequest(JSON.stringify(payload)));

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "CONFIGURATION_ERROR",
    });
    expect(sendApplicationTelegramMock).not.toHaveBeenCalled();
  },
);

it("returns 502 without exposing Telegram delivery details", async () => {
  sendApplicationTelegramMock.mockRejectedValue(
    new Error("TELEGRAM_DELIVERY_FAILED bot-secret"),
  );

  const response = await POST(createRequest(JSON.stringify(payload)));

  expect(response.status).toBe(502);
  await expect(response.json()).resolves.toEqual({ ok: false, error: "DELIVERY_ERROR" });
});
