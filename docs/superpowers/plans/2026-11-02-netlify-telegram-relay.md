# Netlify Telegram Relay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Доставлять заявки с VPS в Telegram через защищённый HTTPS-шлюз на уже подключённом Netlify.

**Architecture:** Публичный `/api/contact` сохраняет существующую проверку формы и выбирает relay, когда задан `CONTACT_RELAY_URL`; иначе использует прямой Telegram fallback. Отдельный `/api/contact/relay` проверяет Bearer-секрет и payload, затем вызывает существующий Telegram-транспорт. Relay-клиент ограничивает время ожидания и нормализует внешние ошибки.

**Tech Stack:** Next.js 16 App Router, TypeScript, Zod, Vitest, native `fetch`, Node `crypto`, Netlify Next.js runtime.

**Spec:** `docs/superpowers/specs/2026-11-02-netlify-telegram-relay-design.md`

## Global Constraints

- UI и публичный контракт формы не меняются.
- Браузер не получает `CONTACT_RELAY_SECRET` или Telegram credentials.
- Relay endpoint принимает только JSON до 16 KiB и повторно применяет `contactSchema`.
- Авторизация использует `Authorization: Bearer <secret>` и безопасное сравнение.
- Внешние ответы и исключения не раскрывают секреты.
- Все внешние HTTPS-запросы имеют таймаут.
- Прямой Telegram fallback остаётся рабочим без `CONTACT_RELAY_URL`.

## Review Focus

- Один заданный `CONTACT_RELAY_URL` без секрета должен завершаться `CONFIGURATION_ERROR`, а не незашифрованной доставкой.
- Netlify имеет `CONTACT_RELAY_SECRET` для входящего endpoint, но не `CONTACT_RELAY_URL`; публичный `/api/contact` должен игнорировать одиночный secret и использовать прямой Telegram.
- Неверный/отсутствующий Bearer header не должен вызывать Telegram или раскрывать ожидаемый secret.
- Relay HTTP 200 с `{ ok: false }`, не-JSON, network error и timeout должны стать `DELIVERY_ERROR` для формы.
- Повторная schema-проверка должна отвергать изменённый или избыточный payload до Telegram.

---

### Task 1: Relay HTTPS client

**Files:**
- Create: `lib/contact-relay.ts`
- Create: `tests/lib/contact-relay.test.ts`

**Interfaces:**
- Consumes: `ContactPayload` from `lib/contact-schema.ts`.
- Produces: `RelayConfig { url: string; secret: string; timeoutMs?: number }` and `sendApplicationRelay(payload, config, fetchImpl?): Promise<void>`.

- [ ] **Step 1: Write failing relay-client tests**

Assert exact POST URL, `application/json`, `Authorization: Bearer <secret>`, unmodified normalized payload, abort signal, success only for 2xx `{ ok: true }`, and generic rejection for non-2xx, `{ ok: false }`, malformed JSON, network failure, and timeout.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm.cmd test -- --run tests/lib/contact-relay.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement relay client**

Create `sendApplicationRelay(payload: ContactPayload, config: RelayConfig, fetchImpl: typeof fetch = fetch): Promise<void>` with an 8-second default timeout and generic `RELAY_DELIVERY_FAILED` errors.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm.cmd test -- --run tests/lib/contact-relay.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 1**

```bash
git add lib/contact-relay.ts tests/lib/contact-relay.test.ts
git commit -m "feat: add secure contact relay client"
```

### Task 2: Protected Netlify relay endpoint

**Files:**
- Create: `app/api/contact/relay/route.ts`
- Create: `tests/api/contact-relay-route.test.ts`

**Interfaces:**
- Consumes: `contactSchema`, `sendApplicationTelegram`, `CONTACT_RELAY_SECRET`, `TELEGRAM_BOT_TOKEN`, and `TELEGRAM_CHAT_ID`.
- Produces: `POST /api/contact/relay` with `{ ok: true }` success and safe 401/400/413/415/500/502 errors.

- [ ] **Step 1: Write failing endpoint tests**

Cover valid authorized request; absent/malformed/wrong Bearer secret; wrong content type; declared and actual body above 16 KiB; malformed JSON; invalid schema; missing configuration; and Telegram rejection/timeout. Assert unauthorized and invalid requests never call Telegram.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm.cmd test -- --run tests/api/contact-relay-route.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement protected relay route**

Use Node runtime, SHA-256 digests plus `timingSafeEqual` for the Bearer secret, bounded body reading, `contactSchema.safeParse`, trimmed environment values, and existing `sendApplicationTelegram`. Do not include credential or upstream details in responses.

- [ ] **Step 4: Run endpoint tests and verify GREEN**

Run: `npm.cmd test -- --run tests/api/contact-relay-route.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add app/api/contact/relay/route.ts tests/api/contact-relay-route.test.ts
git commit -m "feat: add protected Telegram relay endpoint"
```

### Task 3: Contact route delivery selection

**Files:**
- Modify: `app/api/contact/route.ts`
- Modify: `tests/api/contact-route.test.ts`

**Interfaces:**
- Consumes: `sendApplicationRelay` from Task 1 and current `sendApplicationTelegram`.
- Produces: unchanged public `/api/contact`; relay mode when URL exists, direct mode otherwise.

- [ ] **Step 1: Add failing delivery-selection tests**

Assert relay mode uses URL/secret and never Telegram; URL without secret returns configuration error; no URL uses Telegram even when relay secret exists; and relay failure/timeout returns existing `502 DELIVERY_ERROR`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm.cmd test -- --run tests/api/contact-route.test.ts`

Expected: FAIL because the route ignores relay configuration.

- [ ] **Step 3: Implement delivery selection**

When trimmed `CONTACT_RELAY_URL` exists, require trimmed `CONTACT_RELAY_SECRET` and call relay. Otherwise require Telegram token/chat ID and use direct delivery; do not treat a lone relay secret as relay mode.

- [ ] **Step 4: Run focused regressions**

Run: `npm.cmd test -- --run tests/api/contact-route.test.ts tests/api/contact-relay-route.test.ts tests/lib/contact-relay.test.ts tests/lib/telegram.test.ts tests/components/contact-form.test.tsx`

Expected: PASS.

- [ ] **Step 5: Commit Task 3**

```bash
git add app/api/contact/route.ts tests/api/contact-route.test.ts
git commit -m "feat: route contact requests through relay"
```

### Task 4: Configuration, deployment guide, and verification

**Files:**
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/admin-operations.md`

**Interfaces:**
- Consumes: environment contract from Tasks 2–3.
- Produces: exact Netlify and VPS setup/runbook.

- [ ] **Step 1: Document environment separation**

Add blank `CONTACT_RELAY_URL` and `CONTACT_RELAY_SECRET`; document the three Netlify variables, two VPS variables, local-PC `getUpdates` chat-ID discovery, secret generation, deploy order, endpoint check, VPS rebuild/restart, and live form test. Remove the now-invalid direct-Telegram-from-VPS procedure.

- [ ] **Step 2: Run full verification**

Run: `npm.cmd test -- --run`

Expected: all tests PASS.

Run: `npm.cmd run typecheck`

Expected: exit 0.

Run: `npm.cmd run lint`

Expected: exit 0.

Run: `npm.cmd run build`

Expected: production build succeeds and both `/api/contact` and `/api/contact/relay` are dynamic.

- [ ] **Step 3: Commit Task 4**

```bash
git add .env.example README.md docs/admin-operations.md docs/superpowers/specs/2026-11-02-netlify-telegram-relay-design.md docs/superpowers/plans/2026-11-02-netlify-telegram-relay.md
git commit -m "docs: document Netlify Telegram relay"
```

