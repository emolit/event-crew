import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactForm from "@/components/ContactForm";

const successCopy = "Заявка отправлена. Мы свяжемся с вами по указанному контакту.";
const failureCopy = "Не удалось отправить заявку. Проверьте соединение и повторите отправку.";

const validValues = {
  name: "Иван",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventDate: "2026-09-25",
  staffType: "Хостес",
  quantity: "10",
  comment: "Регистрация гостей",
};

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Имя"), validValues.name);
  await user.type(screen.getByLabelText("Телефон"), validValues.phone);
  await user.type(screen.getByLabelText("Telegram"), validValues.telegram);
  await user.type(screen.getByLabelText("Дата мероприятия"), validValues.eventDate);
  await user.selectOptions(screen.getByLabelText("Тип персонала"), validValues.staffType);
  await user.type(screen.getByLabelText("Количество сотрудников"), validValues.quantity);
  await user.type(screen.getByLabelText("Комментарий"), validValues.comment);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ContactForm", () => {
  it("tells the client what the estimate contains", () => {
    render(<ContactForm />);

    expect(screen.getByRole("heading", { level: 2, name: "Расскажите о событии" })).toBeInTheDocument();
    expect(screen.getByText("Вы получите состав, график и стоимость")).toBeInTheDocument();
  });

  it("renders labeled fields, service options, and an inaccessible honeypot", () => {
    render(<ContactForm />);

    for (const label of ["Имя", "Телефон", "Telegram", "Дата мероприятия", "Тип персонала", "Количество сотрудников", "Комментарий"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }

    expect(screen.getByRole("option", { name: "Хостес" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Другое" })).toBeInTheDocument();

    const honeypot = screen.getByLabelText("Ваш сайт");
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveClass("sr-only");
  });

  it("marks name and phone as required and explains the visible asterisk", () => {
    render(<ContactForm />);

    expect(screen.getByText("* обозначает обязательные поля")).toBeVisible();
    for (const label of ["Имя", "Телефон"]) {
      expect(screen.getByLabelText(label)).toBeRequired();
      expect(screen.getByLabelText(label)).toHaveAttribute("aria-required", "true");
    }
  });

  it("shows linked required-field errors without submitting empty data", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: "Отправить заявку" }));

    const nameInput = screen.getByLabelText("Имя");
    const phoneInput = screen.getByLabelText("Телефон");
    expect(nameInput).toHaveAttribute("aria-invalid", "true");
    expect(phoneInput).toHaveAttribute("aria-invalid", "true");
    expect(nameInput).toHaveAttribute("aria-describedby", "name-error");
    expect(phoneInput).toHaveAttribute("aria-describedby", "phone-error");
    expect(screen.getByText("Укажите имя")).toHaveAttribute("id", "name-error");
    expect(screen.getByText("Укажите телефон")).toHaveAttribute("id", "phone-error");
    expect(nameInput).toHaveFocus();
    expect(screen.getByRole("alert")).toHaveAttribute("aria-live", "assertive");
    expect(screen.getByRole("alert")).toHaveTextContent("Проверьте обязательные поля");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a phone with fewer than ten digits", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Имя"), "Иван");
    await user.type(screen.getByLabelText("Телефон"), "123");
    await user.click(screen.getByRole("button", { name: "Отправить заявку" }));

    expect(screen.getByLabelText("Телефон")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Укажите корректный телефон")).toHaveAttribute("id", "phone-error");
  });

  it("posts the complete contact payload and disables the button while submitting", async () => {
    const user = userEvent.setup();
    let resolveRequest: ((value: Response) => void) | undefined;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Отправить заявку" }));

    expect(screen.getByRole("button", { name: "Отправляем…" })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...validValues, website: "" }),
    });

    resolveRequest?.(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    await waitFor(() => expect(screen.getByText(successCopy)).toHaveAttribute("aria-live", "polite"));
  });

  it("resets fields and reports success after a successful request", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })));
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Отправить заявку" }));

    await waitFor(() => expect(screen.getByText(successCopy)).toBeInTheDocument());
    expect(screen.getByLabelText("Имя")).toHaveValue("");
    expect(screen.getByLabelText("Телефон")).toHaveValue("");
    expect(screen.getByLabelText("Комментарий")).toHaveValue("");
  });

  it("preserves entered values and reports the exact failure copy after a failed request", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: false }), { status: 502 })));
    render(<ContactForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Отправить заявку" }));

    await waitFor(() => expect(screen.getByText(failureCopy)).toHaveAttribute("aria-live", "polite"));
    expect(screen.getByLabelText("Имя")).toHaveValue(validValues.name);
    expect(screen.getByLabelText("Телефон")).toHaveValue(validValues.phone);
    expect(screen.getByLabelText("Комментарий")).toHaveValue(validValues.comment);
  });
});
