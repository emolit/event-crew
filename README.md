# EVENT CREW

Одностраничный сайт подбора event-персонала в Москве на Next.js.

## Локальный запуск

1. Установите зависимости:

   ```powershell
   npm install
   ```

2. Создайте `.env.local` в корне проекта:

   ```dotenv
   TELEGRAM_BOT_TOKEN=replace-with-real-bot-token
   TELEGRAM_CHAT_ID=replace-with-real-chat-id
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` обязательны для отправки заявок. `NEXT_PUBLIC_SITE_URL` должен содержать публичный URL после деплоя; локальный fallback — `http://localhost:3000`.

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

- задайте в окружении хостинга `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` и канонический `NEXT_PUBLIC_SITE_URL`;
- замените демонстрационные контакты в `data/site.ts`;
- выполните все команды из раздела «Проверка»;
- для self-hosted-запуска выполните `npm run build`, затем `npm run start`.
