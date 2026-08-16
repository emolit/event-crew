# EVENT CREW Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Собрать production-ready одностраничный сайт EVENT CREW с локальными заменяемыми фотографиями, адаптивной версткой и безопасной отправкой заявок в Telegram.

**Architecture:** Next.js App Router рендерит статические секции как Server Components, а Header, ContactForm и легкие анимационные обертки работают как изолированные Client Components. Повторяющийся контент хранится в типизированных массивах, изображения — под стабильными именами в `public/images`, а Telegram-интеграция ограничена серверным route handler.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Zod, Vitest, React Testing Library, ESLint, Next Image.

## Global Constraints

- Одностраничная структура: Hero, услуги, преимущества, проекты, процесс, CTA/форма и Footer; отзывов нет.
- Бренд: `EVENT CREW`; молочный, черный, белый и один фирменный желтый акцент.
- Логотип: исходный квадратный знак в Header и Footer.
- География и тексты: только Москва; не добавлять вымышленные показатели, отзывы, клиентов и бренды.
- Контент: `services`, `advantages`, `projects`, `processSteps` и `contacts` хранятся в массивах/конфиге и выводятся через `map()`.
- Медиа: локальные файлы в `public/images`, стабильные имена, `next/image`, содержательные `alt`, hero загружается приоритетно.
- Telegram secrets: только `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` на сервере; реальные значения не коммитятся.
- Доступность: один `h1`, логичные `h2`/`h3`, зоны нажатия не меньше 44×44 px, WCAG AA, Escape/focus management в мобильном меню, `prefers-reduced-motion`.
- Адаптивность: mobile-first, без горизонтального скролла; desktop, ноутбук, планшет и мобильный viewport.
- Проверка перед завершением: unit/API/component tests, TypeScript, ESLint, production build и визуальный desktop/mobile audit.

---

## File Map

- `app/layout.tsx` — корневой HTML, шрифты и metadata.
- `app/page.tsx` — только композиция секций.
- `app/globals.css` — Tailwind import, design tokens, базовые стили и reduced motion.
- `app/api/contact/route.ts` — POST endpoint Telegram.
- `components/Header.tsx` — desktop navigation и доступное мобильное меню.
- `components/Hero.tsx`, `Services.tsx`, `Advantages.tsx`, `Projects.tsx`, `Process.tsx`, `Footer.tsx` — самостоятельные секции.
- `components/ContactForm.tsx` — состояние формы, клиентская валидация и статусы отправки.
- `components/Reveal.tsx` — единая умеренная scroll-анимация.
- `components/ui/SectionHeading.tsx` — повторяемая композиция заголовков секций.
- `data/site.ts` — бренд, меню, контакты и основные пути к изображениям.
- `data/services.ts`, `advantages.ts`, `projects.ts`, `process.ts` — типизированный повторяющийся контент.
- `lib/contact-schema.ts` — общая Zod-схема и тип заявки.
- `lib/telegram.ts` — экранирование, форматирование сообщения и вызов Telegram API.
- `tests/` — unit, route и component tests.
- `public/images/brand/event-crew-logo.png` — подготовленная копия предоставленного логотипа.
- `public/images/hero-event.webp`, `public/images/services/*.webp`, `public/images/projects/*.webp` — заменяемые локальные фотографии.
- `.env.example` — имена обязательных env-переменных.

---

### Task 1: Scaffold the typed Next.js project and test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `eslint.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `tests/app/page.test.tsx`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:run`; import alias `@/*`; test environment `jsdom`.

- [ ] **Step 1: Initialize dependencies**

Run:

```powershell
npm init -y
npm install next@latest react@latest react-dom@latest framer-motion zod
npm install -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss eslint eslint-config-next vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: `package.json` and `package-lock.json` exist; install exits 0.

- [ ] **Step 2: Write the failing page smoke test**

```tsx
// tests/app/page.test.tsx
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

it("renders the EVENT CREW primary heading", () => {
  render(<Home />);
  expect(screen.getByRole("heading", { level: 1, name: /персонал для вашего мероприятия/i })).toBeInTheDocument();
});
```

- [ ] **Step 3: Configure TypeScript, Vitest, ESLint, Tailwind and scripts**

Set scripts to:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest",
  "test:run": "vitest run"
}
```

Configure `vitest.config.ts` with React plugin, `jsdom`, `vitest.setup.ts`, and alias `@` to the repository root. Configure `vitest.setup.ts` to import `@testing-library/jest-dom/vitest`. Add `.superpowers/`, `.next/`, `node_modules/`, `.env*` and `!.env.example` to `.gitignore`. Add only the two variable names to `.env.example`.

- [ ] **Step 4: Run the smoke test and verify RED**

Run: `npm run test:run -- tests/app/page.test.tsx`

Expected: FAIL because `app/page.tsx` does not yet render the required heading.

- [ ] **Step 5: Add the minimal app shell and global tokens**

Implement `app/layout.tsx` with `lang="ru"`, import `globals.css`, and render children. Implement `app/page.tsx` with the tested `h1`. In `globals.css`, import Tailwind and define `--background: #f4f1e9`, `--foreground: #11110f`, `--accent: #f5bd00`, `--muted: #73716b`, plus `html { scroll-behavior: smooth; }`, body defaults, overflow protection, selection color and a reduced-motion media query.

- [ ] **Step 6: Verify GREEN and base tooling**

Run:

```powershell
npm run test:run -- tests/app/page.test.tsx
npm run typecheck
npm run lint
```

Expected: all commands exit 0.

- [ ] **Step 7: Commit**

```powershell
git add package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs eslint.config.mjs vitest.config.ts vitest.setup.ts .gitignore .env.example app tests/app/page.test.tsx
git commit -m "chore: scaffold EVENT CREW landing"
```

---

### Task 2: Define typed site content and replacement contracts

**Files:**
- Create: `data/site.ts`
- Create: `data/services.ts`
- Create: `data/advantages.ts`
- Create: `data/projects.ts`
- Create: `data/process.ts`
- Create: `tests/data/content.test.ts`

**Interfaces:**
- Produces: `NavItem`, `ContactItem`, `Service`, `Advantage`, `Project`, `ProcessStep`; exports `siteConfig`, `services`, `advantages`, `projects`, `processSteps`.
- `Project.size` is exactly `"standard" | "wide" | "tall"`.

- [ ] **Step 1: Write content contract tests**

```ts
// tests/data/content.test.ts
import { advantages } from "@/data/advantages";
import { processSteps } from "@/data/process";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { siteConfig } from "@/data/site";

it("provides the complete landing content", () => {
  expect(services).toHaveLength(8);
  expect(advantages).toHaveLength(4);
  expect(projects).toHaveLength(6);
  expect(processSteps.map((step) => step.number)).toEqual(["01", "02", "03", "04"]);
  expect(siteConfig.brand).toBe("EVENT CREW");
});

it("keeps all content images local and replaceable", () => {
  const paths = [siteConfig.heroImage, ...services.map((x) => x.image), ...projects.map((x) => x.image)];
  expect(paths.every((path) => path.startsWith("/images/"))).toBe(true);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test:run -- tests/data/content.test.ts`

Expected: FAIL because the data modules do not exist.

- [ ] **Step 3: Implement exact content types and arrays**

Use stable ids and paths. Required service ids are `hostess`, `promoters`, `helpers`, `waiters`, `coordinators`, `cloakroom`, `registrars`, `animators`. Required image patterns are `/images/services/service-<id>.webp` and `/images/projects/project-01.webp` through `project-06.webp`.

`siteConfig` must include:

```ts
export const siteConfig = {
  brand: "EVENT CREW",
  tagline: "STAFF FOR EVENTS",
  heroImage: "/images/hero-event.webp",
  logo: "/images/brand/event-crew-logo.png",
  nav: [
    { label: "Услуги", href: "#services" },
    { label: "Почему мы", href: "#advantages" },
    { label: "Проекты", href: "#projects" },
    { label: "Как мы работаем", href: "#process" },
    { label: "Контакты", href: "#contacts" }
  ],
  contacts: {
    phone: { label: "Телефон", value: "+7 (000) 000-00-00", href: "tel:+70000000000" },
    telegram: { label: "Telegram", value: "@eventcrew", href: "https://t.me/eventcrew" },
    whatsapp: { label: "WhatsApp", value: "+7 (000) 000-00-00", href: "https://wa.me/70000000000" },
    email: { label: "Email", value: "hello@eventcrew.ru", href: "mailto:hello@eventcrew.ru" }
  }
} as const;
```

Mark these four contact values in code comments as demonstrational, not verified business contacts. Populate all Russian copy from the approved design and original request; do not add statistics, testimonials or client brands.

- [ ] **Step 4: Run tests and typecheck**

Run:

```powershell
npm run test:run -- tests/data/content.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add data tests/data/content.test.ts
git commit -m "feat: add typed landing content"
```

---

### Task 3: Build and test the Telegram contact domain

**Files:**
- Create: `lib/contact-schema.ts`
- Create: `lib/telegram.ts`
- Create: `tests/lib/contact-schema.test.ts`
- Create: `tests/lib/telegram.test.ts`

**Interfaces:**
- Produces: `contactSchema`, `ContactPayload`, `formatTelegramMessage(payload): string`, `sendTelegramMessage(payload, env, fetcher?): Promise<void>`.
- `TelegramEnv` is `{ botToken: string; chatId: string }`.

- [ ] **Step 1: Write failing validation tests**

```ts
import { contactSchema } from "@/lib/contact-schema";

const valid = { name: "Иван", phone: "+7 999 123-45-67", telegram: "@ivan", eventDate: "2026-09-25", staffType: "Хостес", quantity: "10", comment: "Регистрация гостей", website: "" };

it("accepts a valid request", () => expect(contactSchema.safeParse(valid).success).toBe(true));
it("rejects an empty name", () => expect(contactSchema.safeParse({ ...valid, name: "" }).success).toBe(false));
it("rejects a phone with fewer than ten digits", () => expect(contactSchema.safeParse({ ...valid, phone: "123" }).success).toBe(false));
it("rejects a filled honeypot", () => expect(contactSchema.safeParse({ ...valid, website: "spam.example" }).success).toBe(false));
it("rejects non-positive quantity", () => expect(contactSchema.safeParse({ ...valid, quantity: "0" }).success).toBe(false));
```

- [ ] **Step 2: Run schema tests and verify RED**

Run: `npm run test:run -- tests/lib/contact-schema.test.ts`

Expected: FAIL because `contactSchema` does not exist.

- [ ] **Step 3: Implement the Zod schema**

Normalize with `.trim()`. Limit name to 80 chars, phone to 40, Telegram to 80, staffType to 80 and comment to 1500. Validate phone by counting digits after removing non-digits and requiring 10–15. Accept empty optional strings. Transform quantity from empty string to `undefined`, otherwise to an integer from 1 through 500. Require `website` to remain empty.

- [ ] **Step 4: Write failing formatter and sender tests**

Assert that the message starts with `🔔 Новая заявка с сайта`, contains every populated field, renders empty optional fields as `—`, and escapes `<`, `>` and `&` for Telegram HTML mode. Mock `fetch` and assert URL `https://api.telegram.org/botTOKEN/sendMessage`, method POST, `chat_id`, `parse_mode: "HTML"`, and rejection when Telegram returns `{ ok: false }`.

- [ ] **Step 5: Implement Telegram formatting and transport**

Implement `escapeTelegramHtml`, exact Russian labels, and a fetch injection defaulting to global `fetch`. Throw `new Error("TELEGRAM_DELIVERY_FAILED")` for non-2xx or Telegram `ok !== true`; never include token or response body in the thrown message.

- [ ] **Step 6: Run domain tests**

Run: `npm run test:run -- tests/lib`

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add lib tests/lib
git commit -m "feat: validate and format contact requests"
```

---

### Task 4: Expose the secure contact API route

**Files:**
- Create: `app/api/contact/route.ts`
- Create: `tests/api/contact-route.test.ts`

**Interfaces:**
- Consumes: `contactSchema`, `sendTelegramMessage` from Task 3.
- Produces: `POST(request: Request): Promise<Response>` returning `{ ok: true }` or `{ ok: false, error: "VALIDATION_ERROR" | "CONFIGURATION_ERROR" | "DELIVERY_ERROR" }`.

- [ ] **Step 1: Write failing route tests**

Mock `@/lib/telegram`. Cover:

```ts
it("returns 200 and sends a valid request");
it("returns 400 for malformed JSON");
it("returns 400 for invalid fields without calling Telegram");
it("returns 500 when Telegram environment variables are absent");
it("returns 502 when Telegram delivery fails");
```

Use `new Request("http://localhost/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })` and set/restore `process.env` in `beforeEach`/`afterEach`.

- [ ] **Step 2: Run route tests and verify RED**

Run: `npm run test:run -- tests/api/contact-route.test.ts`

Expected: FAIL because the route does not exist.

- [ ] **Step 3: Implement POST with safe status mapping**

Parse JSON in a try/catch, use `contactSchema.safeParse`, read only `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`, call `sendTelegramMessage`, and return JSON with status 200, 400, 500 or 502 as defined above. Add `export const runtime = "nodejs"`.

- [ ] **Step 4: Run route and domain tests**

Run: `npm run test:run -- tests/api tests/lib`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add app/api/contact/route.ts tests/api/contact-route.test.ts
git commit -m "feat: add Telegram contact endpoint"
```

---

### Task 5: Prepare the local replaceable image set

**Files:**
- Create: `public/images/brand/event-crew-logo.png`
- Create: `public/images/hero-event.webp`
- Create: `public/images/services/service-hostess.webp`
- Create: `public/images/services/service-promoters.webp`
- Create: `public/images/services/service-helpers.webp`
- Create: `public/images/services/service-waiters.webp`
- Create: `public/images/services/service-coordinators.webp`
- Create: `public/images/services/service-cloakroom.webp`
- Create: `public/images/services/service-registrars.webp`
- Create: `public/images/services/service-animators.webp`
- Create: `public/images/projects/project-01.webp` through `project-06.webp`
- Create: `docs/images.md`

**Interfaces:**
- Consumes: exact image paths from Task 2.
- Produces: all referenced raster assets with no external runtime dependency.

- [ ] **Step 1: Copy and crop the supplied logo**

Use `C:\Users\hom\Downloads\IMG_4301.PNG` as the source. Preserve the square black field, white border/type and yellow vertical bar. Save a web-ready PNG at exactly `public/images/brand/event-crew-logo.png`.

- [ ] **Step 2: Source or generate a cohesive photo set**

Use the image-generation skill or royalty-friendly event photography discovered through image search. Selection brief for every image: premium contemporary Moscow event atmosphere; realistic diverse adult staff; black, cream and warm-yellow visual accents; documentary editorial lighting; no readable brands, watermarks, celebrity likenesses or fictional client logos.

Specific subjects:

- hero: wide indoor evening event with staff assisting guests;
- hostess: host greeting guests at registration;
- promoters: two promotional staff in a clean exhibition space;
- helpers: event setup assistance carrying neutral equipment;
- waiters: premium banquet service;
- coordinators: coordinator with clipboard/headset on venue floor;
- cloakroom: staffed contemporary cloakroom;
- registrars: conference check-in desk;
- animators: tasteful family-event activity without recognizable characters;
- projects 01–06: corporate reception, conference, exhibition, private celebration, outdoor city event and gala dinner.

- [ ] **Step 3: Normalize files for one-click replacement**

Convert hero to WebP around 1800×1200, services to at least 1200×1500 portrait, and projects to at least 1600×1200 landscape. Keep each under roughly 500 KB where visual quality permits. Do not bake text into photographs.

- [ ] **Step 4: Document the replacement contract**

In `docs/images.md`, list each filename, recommended aspect ratio and subject. State: replacing a file under the same name requires no code change; after replacement restart/rebuild Next.js and hard-refresh if cached.

- [ ] **Step 5: Verify every referenced asset exists**

Run:

```powershell
$assetPaths = @(
  'public/images/brand/event-crew-logo.png',
  'public/images/hero-event.webp',
  'public/images/services/service-hostess.webp',
  'public/images/services/service-promoters.webp',
  'public/images/services/service-helpers.webp',
  'public/images/services/service-waiters.webp',
  'public/images/services/service-coordinators.webp',
  'public/images/services/service-cloakroom.webp',
  'public/images/services/service-registrars.webp',
  'public/images/services/service-animators.webp',
  'public/images/projects/project-01.webp',
  'public/images/projects/project-02.webp',
  'public/images/projects/project-03.webp',
  'public/images/projects/project-04.webp',
  'public/images/projects/project-05.webp',
  'public/images/projects/project-06.webp'
)
$missingAssets = $assetPaths | Where-Object { -not (Test-Path -LiteralPath $_) -or (Get-Item -LiteralPath $_).Length -eq 0 }
if ($missingAssets) { throw "Missing or empty assets: $($missingAssets -join ', ')" }
```

Then run `npm run build`; expected: no missing-image import/runtime errors and all files have non-zero length.

- [ ] **Step 6: Commit**

```powershell
git add public/images docs/images.md
git commit -m "feat: add replaceable EVENT CREW imagery"
```

---

### Task 6: Implement Header, Hero and Footer shell

**Files:**
- Create: `components/Header.tsx`
- Create: `components/Hero.tsx`
- Create: `components/Footer.tsx`
- Create: `components/ui/SectionHeading.tsx`
- Create: `tests/components/header.test.tsx`
- Create: `tests/components/hero-footer.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `siteConfig` from Task 2 and image assets from Task 5.
- Produces: `<Header />`, `<Hero />`, `<Footer />`, `<SectionHeading eyebrow? title description? />`.

- [ ] **Step 1: Write failing interaction and semantic tests**

Assert that Header renders all five navigation links and CTA, burger button exposes `aria-expanded`, click opens a `role="dialog"` mobile menu, Escape closes it, and clicking a nav link closes it. Assert Hero has the sole level-one heading, `next/image` alt text, and an anchor to `#contact`. Assert Footer renders all four configured channels and current copyright copy.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test:run -- tests/components/header.test.tsx tests/components/hero-footer.test.tsx`

Expected: FAIL because components do not exist.

- [ ] **Step 3: Implement the shell components**

Use a fixed blurred Header, `<Image>` for the square logo and hero image, semantic `<nav>`, buttons at least 44 px, focus-visible rings and body scroll locking while mobile menu is open. Hero uses responsive `clamp()` typography and an asymmetric image mask. Footer receives contacts from config and uses external-link attributes only for Telegram/WhatsApp.

- [ ] **Step 4: Compose Header, Hero and Footer in the page**

Ensure the page contains exactly one `h1`; add a temporary `<main>` between Hero and Footer that later tasks replace with sections.

- [ ] **Step 5: Run tests and accessibility-focused assertions**

Run:

```powershell
npm run test:run -- tests/components/header.test.tsx tests/components/hero-footer.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add components app/page.tsx tests/components
git commit -m "feat: add responsive landing shell"
```

---

### Task 7: Implement data-driven content sections and reveal motion

**Files:**
- Create: `components/Reveal.tsx`
- Create: `components/Services.tsx`
- Create: `components/Advantages.tsx`
- Create: `components/Projects.tsx`
- Create: `components/Process.tsx`
- Create: `tests/components/sections.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: arrays from Task 2 and `SectionHeading` from Task 6.
- Produces: section ids `services`, `advantages`, `projects`, `process` and reusable `<Reveal delay?: number>`.

- [ ] **Step 1: Write failing section tests**

Render each section and assert exact item counts 8/4/6/4, heading levels, all local images having non-empty alt, project metadata, process step numbers, and the Moscow-only label. Assert no text matches `/1000|100 мероприятий|10 городов|отзывы/i`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test:run -- tests/components/sections.test.tsx`

Expected: FAIL because section components do not exist.

- [ ] **Step 3: Implement Reveal**

Use Framer Motion `useReducedMotion()` and `whileInView` with `once: true`, small `y` offset (maximum 24 px), opacity transition around 0.55 s and no motion when reduced motion is requested. Keep this the only scroll-animation abstraction.

- [ ] **Step 4: Implement the four sections**

Map every array; do not duplicate card JSX by item. Use CSS/Tailwind grid variants and `Project.size` to produce the asymmetric desktop gallery while remaining one column on narrow screens. Use `next/image` with accurate `sizes` and hover scale no greater than 1.04.

- [ ] **Step 5: Integrate sections into page order**

Order: Header, Hero, Services, Advantages, Projects, Process, later ContactForm section, Footer.

- [ ] **Step 6: Run section tests and typecheck**

Run:

```powershell
npm run test:run -- tests/components/sections.test.tsx
npm run typecheck
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add components app/page.tsx tests/components/sections.test.tsx
git commit -m "feat: add EVENT CREW content sections"
```

---

### Task 8: Build the validated contact form and CTA

**Files:**
- Create: `components/ContactForm.tsx`
- Create: `tests/components/contact-form.test.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `contactSchema` from Task 3 and `/api/contact` from Task 4.
- Produces: `<ContactForm />` inside section `id="contact"` with statuses `idle | submitting | success | error`.

- [ ] **Step 1: Write failing form tests**

With `userEvent`, cover required labels, empty-submit validation, invalid phone, successful JSON request, disabled/loading submit button, success copy and reset, failed request preserving field values and displaying the exact failure copy. Assert honeypot exists with `tabIndex={-1}`, autocomplete disabled and visually hidden.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm run test:run -- tests/components/contact-form.test.tsx`

Expected: FAIL because ContactForm does not exist.

- [ ] **Step 3: Implement accessible controlled form behavior**

Use native labels and inputs, inline `aria-live="polite"` status, `aria-invalid` and linked error ids. Submit JSON keys exactly matching `ContactPayload`: `name`, `phone`, `telegram`, `eventDate`, `staffType`, `quantity`, `comment`, `website`. Populate staff type options from service names plus «Другое».

- [ ] **Step 4: Add the final CTA composition**

Wrap the form in the yellow/black section headed «Нужен персонал на мероприятие?» with approved supporting copy. Keep the form itself on a light panel and ensure the final Header CTA links to `#contact`.

- [ ] **Step 5: Run form and route tests**

Run:

```powershell
npm run test:run -- tests/components/contact-form.test.tsx tests/api/contact-route.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add components/ContactForm.tsx app/page.tsx tests/components/contact-form.test.tsx
git commit -m "feat: add Telegram contact form"
```

---

### Task 9: Complete metadata, responsive polish and production verification

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: component files only where visual audit finds a concrete issue
- Create: `public/images/og-event-crew.png`
- Create: `README.md`
- Create: `tests/app/metadata.test.ts`

**Interfaces:**
- Consumes: completed page and local brand assets.
- Produces: deployable build, SEO metadata and handoff documentation.

- [ ] **Step 1: Write metadata assertions**

Add a small unit test that imports `metadata` from `app/layout.tsx` and asserts title `Персонал для мероприятий в Москве | EVENT CREW`, the approved description, Russian Open Graph locale and `/images/og-event-crew.png`.

- [ ] **Step 2: Run metadata test and verify RED**

Run: `npm run test:run -- tests/app/metadata.test.ts`

Expected: FAIL until complete metadata is exported.

- [ ] **Step 3: Implement metadata and Open Graph image**

Export title, description, metadataBase fallback, Open Graph fields and icons from `app/layout.tsx`. Create `og-event-crew.png` using the black square logo, brand yellow and hero phrase; do not include client names or statistics.

- [ ] **Step 4: Document setup and content replacement**

README must contain: `npm install`, `.env.local` setup, `npm run dev`, all verification commands, deployment notes, contact config path and a link to `docs/images.md`. Explicitly state that real contact values must replace demonstrational values in `data/site.ts` before launch.

- [ ] **Step 5: Run the complete automated verification suite**

Run:

```powershell
npm run test:run
npm run typecheck
npm run lint
npm run build
```

Expected: every command exits 0; no TypeScript, ESLint or Next build errors.

- [ ] **Step 6: Run the site and inspect four viewports**

Start `npm run dev` and use the in-app browser to inspect at least 1440×900, 1024×768, 768×1024 and 390×844. Verify navigation, hero crop, all card grids, asymmetric projects, vertical mobile process, mobile menu focus/Escape, form errors/success mock, footer links, reduced motion and `document.documentElement.scrollWidth === window.innerWidth`.

- [ ] **Step 7: Fix only observed audit defects and rerun checks**

For each defect, write a regression assertion where practical, apply the smallest CSS/component fix, rerun the relevant test, then rerun `npm run typecheck`, `npm run lint` and `npm run build`.

- [ ] **Step 8: Commit final polish**

```powershell
git add app components public/images/og-event-crew.png README.md tests/app/metadata.test.ts
git commit -m "feat: finish EVENT CREW landing page"
```

---

## Completion Evidence

Before claiming completion, capture and report:

- `npm run test:run` test count and passing status;
- `npm run typecheck` exit status;
- `npm run lint` exit status;
- `npm run build` exit status and generated routes;
- viewports checked and any responsive defects corrected;
- full created-file summary grouped by `app`, `components`, `data`, `lib`, `public/images`, `tests` and documentation;
- reminder that Telegram delivery requires real values in `.env.local` and real business contacts must replace demonstrational config values.
