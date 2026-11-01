# Contact Form Range Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Исправить production-отправку формы, добавить период мероприятия и множественный выбор персонала.

**Architecture:** Публичный API принимает нормализованный payload с `eventStartDate`, `eventEndDate` и `staffTypes`. Zod централизованно проверяет даты и допустимые типы, ContactForm управляет чекбоксами, а email formatter превращает данные в читаемое письмо. Origin проверяется против Request origin и настроенного `NEXT_PUBLIC_SITE_URL`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, Nodemailer, Vitest, Testing Library, Tailwind CSS.

**Spec:** `docs/superpowers/specs/2026-11-02-contact-form-range-design.md`

## Global Constraints

- Дата окончания необязательна; без неё событие однодневное.
- Дата окончания не может быть раньше даты начала и не может существовать без неё.
- Разрешён выбор нуля, одного или нескольких допустимых видов персонала.
- SMTP-секреты не выводятся и не передаются клиенту.
- Сохраняются honeypot, same-origin protection, лимит 16 KiB и rate limit.

## Review Focus

- Поддельный Origin при заданном `NEXT_PUBLIC_SITE_URL` должен остаться запрещённым.
- Некорректный `NEXT_PUBLIC_SITE_URL` не должен отключать проверку origin Request.
- Повторные значения и неизвестный вид персонала должны отклоняться схемой.
- Дата окончания без начала и окончание раньше начала должны отклоняться.
- После успешной отправки все чекбоксы и обе даты должны очищаться.

---

### Task 1: Production origin validation

**Files:**
- Modify: `app/api/contact/route.ts`
- Modify: `tests/api/contact-route.test.ts`

**Interfaces:**
- Produces: `isAllowedOrigin(origin: string, requestUrl: string, configuredSiteUrl?: string): boolean` (private route helper).

- [ ] Добавить тест: внешний `https://eventcrw.com` принимается при `NEXT_PUBLIC_SITE_URL=https://eventcrw.com`, даже если Request URL внутренний HTTP.
- [ ] Добавить тесты: посторонний origin запрещён; неверный configured URL не ломает проверку origin Request.
- [ ] Запустить `npm.cmd test -- --run tests/api/contact-route.test.ts` и увидеть ожидаемый `403` в production-сценарии.
- [ ] Реализовать проверку списка доверенных origin без доверия произвольным forwarded-заголовкам.
- [ ] Повторить тест и получить PASS.
- [ ] Commit: `fix: allow configured site origin behind nginx`.

### Task 2: Payload with date range and staff types

**Files:**
- Modify: `lib/contact-schema.ts`
- Modify: `lib/email.ts`
- Modify: `tests/lib/contact-schema.test.ts`
- Modify: `tests/lib/email.test.ts`
- Modify: `tests/api/contact-route.test.ts`

**Interfaces:**
- Produces: `ContactPayload` with `eventStartDate: string`, `eventEndDate: string`, `staffTypes: string[]`.
- Consumes: available names from `services` plus `Другое`.

- [ ] Добавить schema-тесты для одного дня, диапазона, неверного порядка дат, окончания без начала, повторов и неизвестного персонала.
- [ ] Добавить email-тесты для перечисления выбранных типов и форматирования одного дня/диапазона.
- [ ] Обновить API-тест payload и ожидания.
- [ ] Запустить три тестовых файла и увидеть FAIL на старом контракте.
- [ ] Минимально обновить Zod-схему и email formatter.
- [ ] Повторить тесты и получить PASS.
- [ ] Commit: `feat: support event range and staff selection payload`.

### Task 3: Accessible multi-select form UI

**Files:**
- Modify: `components/ContactForm.tsx`
- Modify: `tests/components/contact-form.test.tsx`

**Interfaces:**
- Consumes: новый `ContactPayload` Task 2.
- Produces: fieldset «Виды персонала» с checkbox для каждого service и «Другое»; date inputs `eventStartDate`/`eventEndDate`.

- [ ] Добавить UI-тесты: старого `eventDate`/select нет, две даты присутствуют, несколько checkbox можно выбрать, payload содержит массив, успешная отправка очищает поля.
- [ ] Запустить component-тест и увидеть FAIL на старом интерфейсе.
- [ ] Реализовать доступный fieldset карточек-чекбоксов и блок периода с подсказкой про один день.
- [ ] Сопоставить ошибки схемы с первым видимым полем без потери фокуса.
- [ ] Повторить component-тест и получить PASS.
- [ ] Запустить `npm.cmd run test:run`, `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd run build`.
- [ ] Commit: `feat: add date range and multi-select contact form`.

