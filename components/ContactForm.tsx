"use client";

import { FormEvent, useRef, useState } from "react";
import { services } from "@/data/services";
import { contactSchema } from "@/lib/contact-schema";

type FormField = "name" | "phone" | "telegram" | "eventDate" | "staffType" | "quantity" | "comment" | "website";
type FormStatus = "idle" | "submitting" | "success" | "error";
type FormValues = Record<FormField, string>;

const emptyValues: FormValues = {
  name: "",
  phone: "",
  telegram: "",
  eventDate: "",
  staffType: "",
  quantity: "",
  comment: "",
  website: "",
};

const errorMessages: Partial<Record<FormField, string>> = {
  name: "Укажите имя",
  phone: "Укажите корректный телефон",
};

const successCopy = "Спасибо! Заявка отправлена. Скоро мы свяжемся с вами.";
const failureCopy = "Не удалось отправить заявку. Попробуйте еще раз.";

interface ContactFormProps {
  description?: string;
  eyebrow?: string;
  id?: string;
  title?: string;
}

export default function ContactForm({
  description = "Расскажите о событии — подберём команду под задачи, формат и тайминг вашего мероприятия в Москве.",
  eyebrow = "EVENT CREW",
  id = "contact",
  title = "Нужен персонал на мероприятие?",
}: ContactFormProps = {}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});
  const [status, setStatus] = useState<FormStatus>("idle");
  const [validationSummary, setValidationSummary] = useState("");

  function updateField(field: FormField, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const remainingErrors = { ...current };
      delete remainingErrors[field];
      return remainingErrors;
    });
    setStatus("idle");
    setValidationSummary("");
  }

  function validate(): boolean {
    const parsed = contactSchema.safeParse(values);

    if (parsed.success) {
      setErrors({});
      setValidationSummary("");
      return true;
    }

    const nextErrors: Partial<Record<FormField, string>> = {};
    const invalidFields: FormField[] = [];
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];

      if (typeof field === "string" && field in emptyValues) {
        const formField = field as FormField;
        if (!invalidFields.includes(formField)) {
          invalidFields.push(formField);
        }
        nextErrors[formField] = formField === "phone" && values.phone.trim() === ""
          ? "Укажите телефон"
          : errorMessages[formField] ?? "Проверьте значение поля";
      }
    }

    setErrors(nextErrors);
    setValidationSummary(
      nextErrors.name || nextErrors.phone
        ? "Проверьте обязательные поля и исправьте ошибки."
        : "Проверьте поля формы и исправьте ошибки.",
    );
    const firstVisibleInvalidField = invalidFields.find((field) => field !== "website");
    const fieldElement = firstVisibleInvalidField
      ? formRef.current?.elements.namedItem(firstVisibleInvalidField)
      : null;
    if (fieldElement instanceof HTMLElement) {
      fieldElement.focus();
    }
    return false;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const body: unknown = await response.json();

      if (!response.ok || !isSuccessfulResponse(body)) {
        throw new Error("CONTACT_REQUEST_FAILED");
      }

      setValues(emptyValues);
      setErrors({});
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section aria-labelledby={`${id}-heading`} className="scroll-mt-24 bg-[color:var(--accent)] text-[color:var(--foreground)]" id={id}>
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-16 lg:px-12">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.14em]">{eyebrow}</p>
          <h2 className="mt-4 max-w-xl text-4xl font-black uppercase tracking-[-0.06em] sm:text-5xl lg:text-6xl" id={`${id}-heading`}>
            {title}
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed">
            {description}
          </p>
        </div>

        <form className="bg-[color:var(--background)] p-5 shadow-xl shadow-black/10 sm:p-8" noValidate onSubmit={handleSubmit} ref={formRef}>
          <p className="mb-5 text-sm font-semibold">* — обязательные поля</p>
          {validationSummary ? (
            <p aria-live="assertive" className="mb-5 border-l-4 border-red-700 pl-3 font-bold text-red-800" role="alert">
              {validationSummary}
            </p>
          ) : null}
          <div className="grid gap-5 sm:grid-cols-2">
            <FieldError error={errors.name} id="name-error">
              <label htmlFor="name">Имя</label> <span aria-hidden="true">*</span>
              <input aria-describedby={errors.name ? "name-error" : undefined} aria-invalid={Boolean(errors.name)} aria-required="true" autoComplete="name" className={inputClassName} id="name" name="name" onChange={(event) => updateField("name", event.target.value)} required value={values.name} />
            </FieldError>
            <FieldError error={errors.phone} id="phone-error">
              <label htmlFor="phone">Телефон</label> <span aria-hidden="true">*</span>
              <input aria-describedby={errors.phone ? "phone-error" : undefined} aria-invalid={Boolean(errors.phone)} aria-required="true" autoComplete="tel" className={inputClassName} id="phone" inputMode="tel" name="phone" onChange={(event) => updateField("phone", event.target.value)} required value={values.phone} />
            </FieldError>
            <FieldError error={errors.telegram} id="telegram-error">
              <label htmlFor="telegram">Telegram</label>
              <input aria-describedby={errors.telegram ? "telegram-error" : undefined} aria-invalid={Boolean(errors.telegram)} autoComplete="off" className={inputClassName} id="telegram" name="telegram" onChange={(event) => updateField("telegram", event.target.value)} value={values.telegram} />
            </FieldError>
            <FieldError error={errors.eventDate} id="eventDate-error">
              <label htmlFor="eventDate">Дата мероприятия</label>
              <input aria-describedby={errors.eventDate ? "eventDate-error" : undefined} aria-invalid={Boolean(errors.eventDate)} className={inputClassName} id="eventDate" name="eventDate" onChange={(event) => updateField("eventDate", event.target.value)} type="date" value={values.eventDate} />
            </FieldError>
            <FieldError error={errors.staffType} id="staffType-error">
              <label htmlFor="staffType">Тип персонала</label>
              <select aria-describedby={errors.staffType ? "staffType-error" : undefined} aria-invalid={Boolean(errors.staffType)} className={inputClassName} id="staffType" name="staffType" onChange={(event) => updateField("staffType", event.target.value)} value={values.staffType}>
                <option value="">Выберите тип</option>
                {services.map((service) => (
                  <option key={service.id} value={service.name}>{service.name}</option>
                ))}
                <option value="Другое">Другое</option>
              </select>
            </FieldError>
            <FieldError error={errors.quantity} id="quantity-error">
              <label htmlFor="quantity">Количество сотрудников</label>
              <input aria-describedby={errors.quantity ? "quantity-error" : undefined} aria-invalid={Boolean(errors.quantity)} className={inputClassName} id="quantity" inputMode="numeric" min="1" name="quantity" onChange={(event) => updateField("quantity", event.target.value)} type="number" value={values.quantity} />
            </FieldError>
          </div>
          <FieldError error={errors.comment} id="comment-error">
            <label className="mt-5 block" htmlFor="comment">Комментарий</label>
            <textarea aria-describedby={errors.comment ? "comment-error" : undefined} aria-invalid={Boolean(errors.comment)} className={`${inputClassName} min-h-32 resize-y`} id="comment" name="comment" onChange={(event) => updateField("comment", event.target.value)} value={values.comment} />
          </FieldError>

          <div className="sr-only">
            <label htmlFor="website">Ваш сайт</label>
            <input autoComplete="off" className="sr-only" id="website" name="website" onChange={(event) => updateField("website", event.target.value)} tabIndex={-1} type="text" value={values.website} />
          </div>

          <button className="mt-7 inline-flex min-h-11 w-full items-center justify-center bg-[color:var(--foreground)] px-6 text-sm font-black uppercase tracking-[0.08em] text-[color:var(--background)] transition-transform hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--foreground)] disabled:cursor-not-allowed disabled:opacity-70" disabled={status === "submitting"} type="submit">
            {status === "submitting" ? "Отправляем…" : "Отправить заявку"}
          </button>
          {status === "success" ? <p aria-live="polite" className="mt-4 font-bold text-green-800" role="status">{successCopy}</p> : null}
          {status === "error" ? <p aria-live="polite" className="mt-4 font-bold text-red-800" role="status">{failureCopy}</p> : null}
        </form>
      </div>
    </section>
  );
}

const inputClassName = "mt-2 min-h-11 w-full border border-black/25 bg-white px-3 py-2 text-base outline-none transition focus:border-black focus:ring-2 focus:ring-[color:var(--accent)] aria-[invalid=true]:border-red-700";

function FieldError({ children, error, id }: { children: React.ReactNode; error?: string; id: string }) {
  return (
    <div>
      {children}
      {error ? <p className="mt-1 text-sm font-semibold text-red-800" id={id}>{error}</p> : null}
    </div>
  );
}

function isSuccessfulResponse(body: unknown): body is { ok: true } {
  return typeof body === "object" && body !== null && "ok" in body && body.ok === true;
}
