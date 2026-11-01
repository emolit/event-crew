import { describe, expect, test, vi } from "vitest";
import { formatApplicationEmail, sendApplicationEmail } from "@/lib/email";

const payload = {
  name: "Иван <script>alert(1)</script>\r\nBcc: attacker@example.com",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventStartDate: "2026-09-25",
  eventEndDate: "2026-09-27",
  staffTypes: ["Хостес", "Официанты"],
  quantity: 10,
  comment: "Регистрация & встреча гостей",
  website: "",
};

describe("application email", () => {
  test("formats readable text and escaped HTML without header injection", () => {
    const message = formatApplicationEmail(payload);

    expect(message.subject).not.toMatch(/[\r\n]/);
    expect(message.subject).toContain("Иван");
    expect(message.text).toContain("Телефон: +7 999 123-45-67");
    expect(message.text).toContain("Период мероприятия: 25.09.2026 — 27.09.2026");
    expect(message.text).toContain("Виды персонала: Хостес, Официанты");
    expect(message.text).toContain("Количество: 10");
    expect(message.html).toContain("Иван &lt;script&gt;alert(1)&lt;/script&gt;");
    expect(message.html).toContain("Регистрация &amp; встреча гостей");
    expect(message.html).not.toContain("<script>");
  });

  test("marks a missing end date as a one-day event", () => {
    const message = formatApplicationEmail({ ...payload, eventEndDate: "" });

    expect(message.text).toContain("Период мероприятия: 25.09.2026 (1 день)");
  });

  test("uses encrypted Mail SMTP and sends from and to the configured mailbox", async () => {
    const sendMail = vi.fn().mockResolvedValue({ messageId: "message-1" });
    const createTransport = vi.fn(() => ({ sendMail }));

    await sendApplicationEmail(
      payload,
      {
        host: "smtp.mail.ru",
        port: 465,
        secure: true,
        user: "eventcrew@bk.ru",
        password: "application-password",
        recipient: "eventcrew@bk.ru",
      },
      createTransport,
    );

    expect(createTransport).toHaveBeenCalledWith({
      host: "smtp.mail.ru",
      port: 465,
      secure: true,
      auth: { user: "eventcrew@bk.ru", pass: "application-password" },
    });
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '"EVENT CREW" <eventcrew@bk.ru>',
        to: "eventcrew@bk.ru",
      }),
    );
  });
});
