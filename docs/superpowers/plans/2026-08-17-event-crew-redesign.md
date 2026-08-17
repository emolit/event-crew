# EVENT CREW Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Пересобрать лендинг EVENT CREW в стилистике production board, сохранить рабочую форму и сделать весь контент предметным.

**Architecture:** Сохраняем Next.js App Router и существующие границы секций. Данные и тексты остаются в `data/`, компоненты отвечают за семантическую структуру, а единая система токенов и адаптивная сетка живут в `app/globals.css`; интерактивный список услуг остаётся доступным без обязательного JavaScript-состояния на мобильном.

**Tech Stack:** Next.js 16, React 19, TypeScript 6, Tailwind CSS 4, Framer Motion, Vitest, Testing Library.

## Global Constraints

- Палитра: `#0A0A09`, `#F2EFE6`, `#F4BD00`, `#8A8982`, `#CAC7BD`, `#B83A2D`.
- Шрифты: `Roboto Condensed` для display и `Manrope` для body/utility, подключение через `next/font/google`, кириллица обязательна.
- База отступов 4 px; сетка 12/8/4 колонок; ширины проверки 360, 390, 768, 1024 и 1440 px.
- Минимальная зона нажатия 44 × 44 px, WCAG AA, видимый focus, reduced motion.
- Не добавлять shadcn/ui или новый UI-фреймворк: использовать существующие доступные контролы и семантические токены.
- Не менять API формы, схему валидации, rate limit и Telegram-интеграцию.
- Не использовать рекламные клише, риторические вопросы, тройные списки, `transition: all`, декоративные градиенты и одинаковые карточки для всех секций.

---

### Task 1: Зафиксировать текстовые и тематические контракты

**Files:**
- Modify: `tests/data/content.test.ts`
- Modify: `tests/components/hero-footer.test.tsx`
- Modify: `tests/app/metadata.test.ts`
- Modify: `data/site.ts`
- Modify: `data/services.ts`
- Modify: `data/advantages.ts`
- Modify: `data/process.ts`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: существующие типы `SiteConfig`, `Service`, `Advantage`, `ProcessStep`.
- Produces: утверждённые видимые строки и metadata, которые используют все секции.

- [ ] **Step 1: Написать падающие тесты нового текста**

```tsx
expect(screen.getByRole("heading", { level: 1, name: "Люди, на которых держится событие" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Рассчитать команду" })).toHaveAttribute("href", "#contact");
expect(advantages.map(({ title }) => title)).toEqual([
  "Фиксируем состав и смены",
  "Подтверждаем выход",
  "Остаёмся на связи",
  "Находим замену",
]);
```

- [ ] **Step 2: Запустить тесты и увидеть RED**

Run: `npm run test:run -- tests/data/content.test.ts tests/components/hero-footer.test.tsx tests/app/metadata.test.ts`
Expected: FAIL на старом hero, преимуществах и metadata.

- [ ] **Step 3: Переписать данные и metadata**

Установить title `Персонал для мероприятий в Москве | EVENT CREW`, description `Подберём и выведем на площадку хостес, координаторов, регистраторов и линейный персонал в Москве.`. Для каждой услуги оставить роль и одно предложение о конкретной работе сотрудника. Для шагов зафиксировать результаты: бриф, согласованный состав и смета, подтверждённые смены, выход команды.

- [ ] **Step 4: Запустить focused tests**

Run: `npm run test:run -- tests/data/content.test.ts tests/components/hero-footer.test.tsx tests/app/metadata.test.ts`
Expected: PASS.

- [ ] **Step 5: Закоммитить редакционную систему**

```bash
git add data app/layout.tsx tests/data/content.test.ts tests/components/hero-footer.test.tsx tests/app/metadata.test.ts
git commit -m "content: sharpen EVENT CREW copy"
```

### Task 2: Ввести токены и типографику production board

**Files:**
- Modify: `lib/theme.ts`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `tests/app/contrast.test.ts`
- Create: `.interface-design/system.md`

**Interfaces:**
- Consumes: `themeColors` в inline style корневого layout.
- Produces: CSS-переменные `--stage-black`, `--work-paper`, `--tape-yellow`, `--rig-grey`, `--steel-line`, `--signal-red`, `--font-display`, `--font-body`.

- [ ] **Step 1: Написать падающий тест токенов**

```ts
expect(themeColors).toMatchObject({
  background: "#F2EFE6",
  foreground: "#0A0A09",
  accent: "#F4BD00",
});
expect(css).toContain("--stage-black");
expect(css).not.toContain("transition: all");
```

- [ ] **Step 2: Запустить тест**

Run: `npm run test:run -- tests/app/contrast.test.ts`
Expected: FAIL на старых hex и отсутствующих токенах.

- [ ] **Step 3: Прочитать локальную документацию Next и реализовать тему**

Run: `rg -n "next/font|font variables" node_modules/next/dist/docs`

Подключить `Roboto_Condensed({ subsets: ["cyrillic", "latin"], variable: "--font-display" })` и `Manrope({ subsets: ["cyrillic", "latin"], variable: "--font-body" })`. Записать токены, типографическую шкалу, spacing и стратегию surface-color shifts в `.interface-design/system.md`. Пересобрать базовые стили, focus ring, selection и reduced motion.

- [ ] **Step 4: Проверить тему**

Run: `npm run test:run -- tests/app/contrast.test.ts && npm run typecheck`
Expected: PASS.

- [ ] **Step 5: Закоммитить систему**

```bash
git add lib/theme.ts app/layout.tsx app/globals.css tests/app/contrast.test.ts .interface-design/system.md
git commit -m "style: establish EVENT CREW production system"
```

### Task 3: Пересобрать header и hero

**Files:**
- Modify: `components/Header.tsx`
- Modify: `components/Hero.tsx`
- Modify: `tests/components/header.test.tsx`
- Modify: `tests/components/hero-footer.test.tsx`

**Interfaces:**
- Consumes: `siteConfig`, корневые font/theme variables.
- Produces: header с прежним accessible mobile menu и hero с `crew-line`, project note и CTA.

- [ ] **Step 1: Написать падающие структурные тесты**

```tsx
expect(screen.getByText("Москва / состав от 2 человек / на связи в день события")).toBeInTheDocument();
expect(container.querySelector('[data-crew-line="hero"]')).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Обсудить событие" })).toHaveAttribute("href", "#contact");
```

- [ ] **Step 2: Убедиться в RED**

Run: `npm run test:run -- tests/components/header.test.tsx tests/components/hero-footer.test.tsx`
Expected: FAIL на новых элементах.

- [ ] **Step 3: Реализовать композицию**

Сохранить `<header>`, `<nav>`, `<h1>`, Next Image и текущий focus trap. Добавить служебную карточку как обычный текст, `aria-hidden` только для линии. Не помещать текст поверх важных лиц на фотографии.

- [ ] **Step 4: Проверить компоненты**

Run: `npm run test:run -- tests/components/header.test.tsx tests/components/hero-footer.test.tsx`
Expected: PASS, включая Escape, Tab loop и возврат фокуса.

- [ ] **Step 5: Закоммитить**

```bash
git add components/Header.tsx components/Hero.tsx tests/components/header.test.tsx tests/components/hero-footer.test.tsx app/globals.css
git commit -m "feat: rebuild EVENT CREW opening"
```

### Task 4: Пересобрать услуги и контрольный лист

**Files:**
- Modify: `components/Services.tsx`
- Modify: `components/Advantages.tsx`
- Modify: `components/ui/SectionHeading.tsx`
- Modify: `tests/components/sections.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `services`, `advantages`, общие tokens.
- Produces: desktop service matrix, mobile image flow, semantic operations checklist.

- [ ] **Step 1: Написать падающие тесты семантики**

```tsx
expect(within(serviceSection).getByRole("list")).toBeInTheDocument();
expect(within(advantageSection).getByRole("list")).toBeInTheDocument();
expect(within(serviceSection).getAllByRole("img")).toHaveLength(8);
```

- [ ] **Step 2: Убедиться в RED**

Run: `npm run test:run -- tests/components/sections.test.tsx`
Expected: FAIL на структуре list.

- [ ] **Step 3: Реализовать секции**

Использовать `<ul>/<li>` и CSS grid. На desktop выбрать первую фотографию как крупный якорь, остальные кадры показывать в ритмичной 2×N ленте без JS-скрытия контента. На mobile сохранить изображения 2:3, одно на услугу. Crew line повторить у заголовка и одной активной строки.

- [ ] **Step 4: Проверить секции**

Run: `npm run test:run -- tests/components/sections.test.tsx`
Expected: PASS.

- [ ] **Step 5: Закоммитить**

```bash
git add components/Services.tsx components/Advantages.tsx components/ui/SectionHeading.tsx tests/components/sections.test.tsx app/globals.css
git commit -m "feat: compose services as a crew roster"
```

### Task 5: Пересобрать проекты, тайминг, форму и подвал

**Files:**
- Modify: `components/Projects.tsx`
- Modify: `components/Process.tsx`
- Modify: `components/ContactForm.tsx`
- Modify: `components/Footer.tsx`
- Modify: `tests/components/sections.test.tsx`
- Modify: `tests/components/contact-form.test.tsx`
- Modify: `tests/components/hero-footer.test.tsx`
- Modify: `app/globals.css`

**Interfaces:**
- Consumes: `projects`, `processSteps`, `siteConfig.contacts`, существующий submit flow.
- Produces: project captions вне изображения, responsive timeline, двухколоночная contact zone.

- [ ] **Step 1: Написать падающие тесты структуры и текста**

```tsx
expect(within(projectCard).getByTestId("project-caption")).toBeInTheDocument();
expect(screen.getByText("Вы получите состав, график и стоимость")).toBeInTheDocument();
expect(screen.getByRole("contentinfo")).not.toHaveTextContent(/персонал для вашего мероприятия/i);
```

- [ ] **Step 2: Убедиться в RED**

Run: `npm run test:run -- tests/components/sections.test.tsx tests/components/contact-form.test.tsx tests/components/hero-footer.test.tsx`
Expected: FAIL на новых captions и copy.

- [ ] **Step 3: Реализовать финальные секции**

В проектах вынести type/title/roles под `<Image>`. Процесс собрать как timeline, сохранив номера только для четырёх последовательных этапов. Не менять имена form fields, zod messages или submit handler. Сократить footer до бренда, контактов и nav.

- [ ] **Step 4: Проверить интерактив и секции**

Run: `npm run test:run -- tests/components/sections.test.tsx tests/components/contact-form.test.tsx tests/components/hero-footer.test.tsx`
Expected: PASS.

- [ ] **Step 5: Закоммитить**

```bash
git add components/Projects.tsx components/Process.tsx components/ContactForm.tsx components/Footer.tsx tests/components app/globals.css
git commit -m "feat: finish EVENT CREW production flow"
```

### Task 6: Полная проверка и визуальная доводка

**Files:**
- Modify when required: `app/globals.css`, `components/*.tsx`, `tests/**/*.test.*`
- Create: `docs/superpowers/reports/2026-08-17-event-crew-redesign.md`

**Interfaces:**
- Consumes: весь лендинг.
- Produces: проверенный responsive build и отчёт.

- [ ] **Step 1: Выполнить полный автоматический gate**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build`
Expected: 62+ PASS, exit 0 для всех команд.

- [ ] **Step 2: Запустить production-like preview**

Run: `npm run dev`
Expected: Next.js сообщает локальный URL без compile errors.

- [ ] **Step 3: Проверить браузер**

На 360, 390, 768, 1024 и 1440 px проверить: отсутствие overflow; читаемый hero crop; порядок заголовков; 44 px targets; menu focus/Escape; пустую форму; ошибки; успешную mocked отправку; anchors; reduced motion. Снять desktop и mobile screenshots.

- [ ] **Step 4: Провести четыре дизайн-проверки и stop-slop аудит**

Swap: замена display face должна разрушать характер. Squint: hero и CTA остаются фокусом. Signature: crew line видна в hero, заголовках, roster, timeline и форме. Token: в CSS нет случайных брендовых hex. Проверить видимые строки и metadata по quick checks `stop-slop`; итоговый балл не ниже 40/50.

- [ ] **Step 5: Исправить найденное и повторить gate**

Run: `npm run test:run && npm run typecheck && npm run lint && npm run build`
Expected: все команды exit 0 после исправлений.

- [ ] **Step 6: Записать отчёт и закоммитить**

```bash
git add app components data lib tests .interface-design docs/superpowers/reports
git commit -m "feat: redesign EVENT CREW landing"
```
