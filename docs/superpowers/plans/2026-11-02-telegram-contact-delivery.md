# Telegram Contact Delivery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Доставлять проверенные заявки EVENT CREW в закрытую Telegram-группу через Bot API вместо заблокированного SMTP.

**Architecture:** Новый модуль форматирует заявку в обычный текст и вызывает Telegram `sendMessage` через встроенный `fetch` с таймаутом. Текущий route handler сохраняет все проверки входного запроса и подменяет только конфигурацию и вызов канала доставки.

**Tech Stack:** Next.js 16 App Router, TypeScript, Zod, Vitest, Telegram Bot API, native `fetch`/`AbortSignal.timeout`.

**Spec:** `docs/superpowers/specs/2026-11-02-telegram-contact-delivery-design.md`

## Global Constraints

- Внешний вид, поля и клиентская логика формы не меняются.
- `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` доступны только серверу.
- Все существующие проверки origin, body size, rate limit, honeypot и schema сохраняются.
- Пользовательские данные отправляются без `parse_mode`, чтобы Telegram не интерпретировал разметку.
- Ошибки конфигурации и доставки не раскрывают токен или ответ Telegram клиенту.
- SMTP и `nodemailer` удаляются после перехода.

## Review Focus

- Переводы строк и специальные символы в пользовательском тексте должны отображаться буквально; тестируется форматтером в Task 1.
- Telegram может вернуть HTTP 200 с `{ ok: false }`; тестируется транспортом в Task 1.
- Зависший HTTPS-запрос должен завершаться по таймауту и превращаться в `DELIVERY_ERROR`; тестируется транспортом и route handler в Tasks 1–2.
- Отрицательный `chat_id` группы должен передаваться строкой без числового преобразования; тестируется транспортом в Task 1.
- Отсутствующая переменная окружения должна вернуть `CONFIGURATION_ERROR`, не выполнять запрос и не раскрывать секреты; тестируется route handler в Task 2.

---

### Task 1: Telegram formatter and transport

**Files:**
- Create: `lib/telegram.ts`
- Create: `tests/lib/telegram.test.ts`

**Interfaces:**
- Consumes: `ContactPayload` from `lib/contact-schema.ts`.
- Produces: `formatApplicationTelegram(payload: ContactPayload): string` and `sendApplicationTelegram(payload: ContactPayload, config: TelegramConfig, fetchImpl?: typeof fetch): Promise<void>`.

- [ ] **Step 1: Write failing formatter tests**

Test exact labels, one-day/date-range formatting, multiple personnel types, empty optional fields as `—`, and literal special characters/newlines.

- [ ] **Step 2: Run formatter tests and verify failure**

Run: `npm.cmd test -- --run tests/lib/telegram.test.ts`

Expected: FAIL because `lib/telegram.ts` does not exist.

- [ ] **Step 3: Implement the formatter**

Create `formatApplicationTelegram(payload: ContactPayload): string` with a compact Russian plain-text message headed `🟡 НОВАЯ ЗАЯВКА EVENT CREW`.

- [ ] **Step 4: Write failing transport tests**

Assert POST to `https://api.telegram.org/bot<TOKEN>/sendMessage`, JSON body `{ chat_id, text }`, no `parse_mode`, preservation of negative string chat ID, rejection on non-2xx, `{ ok: false }`, malformed response, network failure, and timeout/abort.

- [ ] **Step 5: Implement the Telegram transport**

Define `TelegramConfig { token: string; chatId: string; timeoutMs?: number }`; call native `fetch` with JSON and a bounded abort signal; normalize every unsuccessful result to `TELEGRAM_DELIVERY_FAILED` without embedding the token or upstream response.

- [ ] **Step 6: Run Telegram module tests**

Run: `npm.cmd test -- --run tests/lib/telegram.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Task 1**

```bash
git add lib/telegram.ts tests/lib/telegram.test.ts
git commit -m "feat: add Telegram application delivery"
```

### Task 2: Contact API integration and SMTP removal

**Files:**
- Modify: `app/api/contact/route.ts`
- Modify: `tests/api/contact-route.test.ts`
- Delete: `lib/email.ts`
- Delete: `tests/lib/email.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: `sendApplicationTelegram` from Task 1 and `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` from server environment.
- Produces: unchanged public `POST /api/contact` response contract.

- [ ] **Step 1: Replace SMTP expectations with failing Telegram route tests**

Keep existing request-safety cases; assert successful Telegram invocation, missing token or chat ID returns `500 CONFIGURATION_ERROR`, and rejected/aborted delivery returns `502 DELIVERY_ERROR`.

- [ ] **Step 2: Run route tests and verify failure**

Run: `npm.cmd test -- --run tests/api/contact-route.test.ts`

Expected: FAIL because the route still requires SMTP.

- [ ] **Step 3: Integrate Telegram configuration and sender**

Read trimmed `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`; return configuration error before delivery when either is absent; otherwise await `sendApplicationTelegram` and preserve the current safe public error contract.

- [ ] **Step 4: Remove the SMTP implementation and dependency**

Delete `lib/email.ts` and its tests; run `npm.cmd uninstall nodemailer @types/nodemailer` so both manifests stay synchronized.

- [ ] **Step 5: Run focused API and form regression tests**

Run: `npm.cmd test -- --run tests/api/contact-route.test.ts tests/components/contact-form.test.tsx tests/lib/contact-schema.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit Task 2**

```bash
git add app/api/contact/route.ts tests/api/contact-route.test.ts package.json package-lock.json
git add -u lib/email.ts tests/lib/email.test.ts
git commit -m "feat: send contact requests to Telegram"
```

### Task 3: Configuration, operations documentation, and full verification

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/admin-operations.md`

**Interfaces:**
- Consumes: environment variable names from Task 2.
- Produces: exact local and production setup instructions for the site owner.

- [ ] **Step 1: Document the new environment contract**

Replace SMTP examples with blank `TELEGRAM_BOT_TOKEN=` and `TELEGRAM_CHAT_ID=` entries; document BotFather creation, private group setup, `getUpdates` chat-ID discovery, safe `.env.local` editing, restart, and test submission.

- [ ] **Step 2: Verify no active SMTP references remain**

Run: `rg -n "SMTP_|nodemailer|sendApplicationEmail" app components lib tests .env.example README.md docs/admin-operations.md package.json package-lock.json`

Expected: no matches.

- [ ] **Step 3: Run the complete verification suite**

Run: `npm.cmd test -- --run`

Expected: all tests PASS.

Run: `npm.cmd run typecheck`

Expected: exit 0.

Run: `npm.cmd run lint`

Expected: exit 0.

Run: `npm.cmd run build`

Expected: production build succeeds and `/api/contact` remains dynamic.

- [ ] **Step 4: Commit Task 3**

```bash
git add .env.example README.md docs/admin-operations.md
git commit -m "docs: document Telegram request delivery"
```

