import { sendTelegramMessage } from "@/lib/telegram";
import { POST } from "@/app/api/contact/route";

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

function createRequest(body: string): Request {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

beforeEach(() => {
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
