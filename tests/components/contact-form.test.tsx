import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import ContactForm from "@/components/ContactForm";

const successCopy = "Спасибо! Заявка отправлена. Скоро мы свяжемся с вами.";
const failureCopy = "Не удалось отправить заявку. Попробуйте еще раз.";

const validValues = {
  name: "Иван",
  phone: "+7 999 123-45-67",
  telegram: "@ivan",
  eventStartDate: "2026-09-25",
  eventEndDate: "2026-09-27",
  staffTypes: ["Хостес", "Официанты"],
  quantity: "10",
  comment: "Регистрация гостей",
};

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Имя"), validValues.name);
  await user.type(screen.getByLabelText("Телефон"), validValues.phone);
  await user.type(screen.getByLabelText("Telegram"), validValues.telegram);
  await user.type(screen.getByLabelText("Дата начала"), validValues.eventStartDate);
  await user.type(screen.getByLabelText("Дата окончания"), validValues.eventEndDate);
  for (const staffType of validValues.staffTypes) {
    await user.click(screen.getByRole("checkbox", { name: staffType }));
  }
  await user.type(screen.getByLabelText("Количество сотрудников"), validValues.quantity);
  await user.type(screen.getByLabelText("Комментарий"), validValues.comment);
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ContactForm", () => {
  it("uses the dark editorial treatment with a focused form card", () => {
    const { container } = render(<ContactForm />);

    const section = container.querySelector("#contact");
    expect(section).toHaveClass("bg-[color:var(--foreground)]", "text-white", "overflow-hidden");
    expect(screen.getByText("Ответим и уточним детали")).toBeInTheDocument();
    expect(screen.getByText("Подберём команду и рассчитаем стоимость")).toBeInTheDocument();
    expect(screen.getByRole("form", { name: /заявка на персонал/i })).toHaveClass(
      "rounded-3xl",
      "border-white/15",
      "bg-white/[0.06]",
    );
    expect(screen.getByRole("button", { name: "Отправить заявку" })).toHaveClass(
      "bg-[color:var(--accent)]",
      "text-[color:var(--foreground)]",
    );
  });

  it("renders a date range, personnel checkboxes, and an inaccessible honeypot", () => {
    render(<ContactForm />);

    for (const label of ["Имя", "Телефон", "Telegram", "Дата начала", "Дата окончания", "Количество сотрудников", "Комментарий"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }

    expect(screen.getByRole("group", { name: "Виды персонала" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Хостес" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Другое" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Дата мероприятия")).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox", { name: "Тип персонала" })).not.toBeInTheDocument();

    const honeypot = screen.getByLabelText("Ваш сайт");
    expect(honeypot).toHaveAttribute("autocomplete", "off");
    expect(honeypot).toHaveAttribute("tabindex", "-1");
    expect(honeypot).toHaveClass("sr-only");
  });

  it("marks name and phone as required and explains the visible asterisk", () => {
    render(<ContactForm />);

    expect(screen.getByText("* — обязательные поля")).toBeVisible();
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

  it("links an invalid date range error to the end date and focuses it", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Имя"), "Иван");
    await user.type(screen.getByLabelText("Телефон"), "+7 999 123-45-67");
    await user.type(screen.getByLabelText("Дата начала"), "2026-09-27");
    await user.type(screen.getByLabelText("Дата окончания"), "2026-09-25");
    await user.click(screen.getByRole("button", { name: "Отправить заявку" }));

    expect(screen.getByLabelText("Дата окончания")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Дата окончания")).toHaveAttribute("aria-describedby", "eventEndDate-error");
    expect(screen.getByLabelText("Дата окончания")).toHaveFocus();
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
    expect(screen.getByLabelText("Дата начала")).toHaveValue("");
    expect(screen.getByLabelText("Дата окончания")).toHaveValue("");
    expect(screen.getByRole("checkbox", { name: "Хостес" })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Официанты" })).not.toBeChecked();
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
    expect(screen.getByRole("checkbox", { name: "Хостес" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Официанты" })).toBeChecked();
  });
});
