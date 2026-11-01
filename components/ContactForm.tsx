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
  description = "Расскажите о формате, дате и задачах — предложим подходящий состав и быстро подготовим расчёт.",
  eyebrow = "Обсудим ваше мероприятие",
  id = "contact",
  title = "Соберём команду для вашего события",
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
    <section aria-labelledby={`${id}-heading`} className="relative scroll-mt-24 overflow-hidden border-y border-white/10 bg-[color:var(--foreground)] text-white" id={id}>
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-40 size-[32rem] rounded-full bg-[color:var(--accent)]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-[color:var(--accent)]/60 to-transparent" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-start lg:gap-16 lg:px-12">
        <div className="lg:sticky lg:top-32">
          <p className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-[color:var(--accent)] before:h-px before:w-10 before:bg-[color:var(--accent)]">{eyebrow}</p>
          <h2 className="mt-5 max-w-xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.06em] sm:text-5xl lg:text-6xl" id={`${id}-heading`}>
            {title}
          </h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-white/65 sm:text-lg">
            {description}
          </p>
          <div className="mt-8 grid gap-3 text-sm font-bold sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <p className="flex items-start gap-3"><span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-[color:var(--accent)]" />Ответим и уточним детали</p>
            <p className="flex items-start gap-3"><span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-[color:var(--accent)]" />Подберём команду и рассчитаем стоимость</p>
          </div>
        </div>

        <form aria-label="Заявка на персонал" className="rounded-3xl border border-white/15 bg-white/[0.06] p-5 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-8 lg:p-10" noValidate onSubmit={handleSubmit} ref={formRef}>
          <div className="mb-7 flex items-end justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[color:var(--accent)]">Короткая заявка</p>
              <p className="mt-2 text-xl font-black uppercase tracking-[-0.03em] sm:text-2xl">Расскажите о задаче</p>
            </div>
            <p className="shrink-0 text-xs font-semibold text-white/45">* — обязательно</p>
          </div>
          <p className="sr-only">* — обязательные поля</p>
          {validationSummary ? (
            <p aria-live="assertive" className="mb-5 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 font-bold text-red-100" role="alert">
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

          <button className="mt-7 inline-flex min-h-13 w-full items-center justify-center rounded-xl bg-[color:var(--accent)] px-6 text-sm font-black uppercase tracking-[0.08em] text-[color:var(--foreground)] transition-[transform,filter] hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--accent)] disabled:cursor-not-allowed disabled:opacity-70" disabled={status === "submitting"} type="submit">
            {status === "submitting" ? "Отправляем…" : "Отправить заявку"}
          </button>
          {status === "success" ? <p aria-live="polite" className="mt-4 rounded-xl border border-green-300/30 bg-green-400/10 px-4 py-3 font-bold text-green-100" role="status">{successCopy}</p> : null}
          {status === "error" ? <p aria-live="polite" className="mt-4 rounded-xl border border-red-300/30 bg-red-400/10 px-4 py-3 font-bold text-red-100" role="status">{failureCopy}</p> : null}
        </form>
      </div>
    </section>
  );
}

const inputClassName = "mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-black/25 px-4 py-3 text-base text-white outline-none transition placeholder:text-white/35 focus:border-[color:var(--accent)] focus:bg-black/35 focus:ring-2 focus:ring-[color:var(--accent)]/25 aria-[invalid=true]:border-red-400 [color-scheme:dark]";

function FieldError({ children, error, id }: { children: React.ReactNode; error?: string; id: string }) {
  return (
    <div>
      {children}
      {error ? <p className="mt-1 text-sm font-semibold text-red-300" id={id}>{error}</p> : null}
    </div>
  );
}

function isSuccessfulResponse(body: unknown): body is { ok: true } {
  return typeof body === "object" && body !== null && "ok" in body && body.ok === true;
}
