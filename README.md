# EVENT CREW

Одностраничный сайт подбора event-персонала в Москве на Next.js.

## Локальный запуск

1. Установите зависимости:

   ```powershell
   npm install
   ```

2. Создайте `.env.local` в корне проекта:

   ```dotenv
   TELEGRAM_BOT_TOKEN=replace-with-bot-token
   TELEGRAM_CHAT_ID=-1001234567890
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   `TELEGRAM_BOT_TOKEN` выдаёт официальный `@BotFather`. `TELEGRAM_CHAT_ID` — строковый ID закрытой группы, обычно начинающийся с `-100`. Оба значения обязательны и доступны только серверу. `NEXT_PUBLIC_SITE_URL` должен содержать публичный URL после деплоя; локальный fallback — `http://localhost:3000`.

3. Запустите dev-сервер:

   ```powershell
   npm run dev
   ```

## Проверка

```powershell
npm run test:run
npm run typecheck
npm run lint
npm run build
```

## Контент и контакты

Контакты хранятся в [`data/site.ts`](data/site.ts). Сейчас в файле указаны демонстрационные значения. **До запуска обязательно замените их на реальные бизнес-контакты.**

Правила замены локальных фотографий и логотипа: [`docs/images.md`](docs/images.md).

## Деплой

Проект можно развернуть на Node.js-платформе с поддержкой Next.js. До публикации:

- задайте в окружении хостинга Telegram-переменные из `.env.example` и канонический `NEXT_PUBLIC_SITE_URL`;
- замените демонстрационные контакты в `data/site.ts`;
- выполните все команды из раздела «Проверка»;
- для self-hosted-запуска выполните `npm run build`, затем `npm run start`.

### Защита публичной формы

API формы принимает только same-origin JSON-запросы размером до 16 KiB и применяет локальный скользящий лимит: 5 принятых попыток за 10 минут для первого адреса в `x-forwarded-for` (или ключа `unknown`). Лимитер намеренно ограничен по памяти, но его состояние существует только внутри одного Node.js/serverless-инстанса и не обеспечивает глобальное ограничение между инстансами. Перед production-запуском обязательно настройте эквивалентный rate limit на edge/provider-уровне.
