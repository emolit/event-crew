# Netlify-шлюз для заявок в Telegram

## Цель

Сохранить доставку заявок в закрытую Telegram-группу, несмотря на блокировку `api.telegram.org:443` на VPS REG.RU. Внешний вид формы и публичный контракт `/api/contact` не меняются.

## Выбранная схема

```text
Браузер → eventcrw.com/api/contact → защищённый endpoint Netlify → Telegram Bot API
```

На VPS `/api/contact` выполняет все существующие проверки формы и отправляет нормализованную заявку в Netlify по HTTPS. Новый `POST /api/contact/relay` на Netlify повторно валидирует секрет и payload, после чего использует существующий Telegram-транспорт. Relay никогда не вызывает `/api/contact`, поэтому цикл невозможен.

Рассматривались Web3Forms и запрос на разблокировку Telegram у REG.RU. Web3Forms меняет канал на почту, а разблокировка зависит от провайдера; Netlify уже подключён к GitHub и сохраняет желаемую доставку в Telegram.

## Конфигурация

На VPS:

- `CONTACT_RELAY_URL=https://magical-stroopwafel-621e60.netlify.app/api/contact/relay`
- `CONTACT_RELAY_SECRET=<случайная строка>`
- Telegram-токен на VPS не нужен.

В Netlify Environment Variables:

- `CONTACT_RELAY_SECRET` — та же случайная строка;
- `TELEGRAM_BOT_TOKEN` — токен BotFather;
- `TELEGRAM_CHAT_ID` — строковый ID закрытой группы.

ID группы определяется с пользовательского компьютера через `getUpdates`, поскольку VPS не имеет доступа к Telegram. Токен и секрет не передаются в чат и не коммитятся.

## Безопасность и ошибки

- Relay принимает только `application/json`, ограничивает тело 16 KiB и повторно применяет `contactSchema`.
- Секрет передаётся в `Authorization: Bearer ...` и сравнивается безопасно; ответы не раскрывают его, токен или ответ Telegram.
- Запрос VPS → Netlify имеет короткий таймаут. Любая недоступность relay или Telegram возвращается форме как существующий `DELIVERY_ERROR`.
- Без всех трёх Netlify-переменных relay возвращает безопасный `CONFIGURATION_ERROR`.
- Прямой режим Telegram сохраняется как локальный fallback, если `CONTACT_RELAY_URL` не задан.

## Проверка и выпуск

- Тесты relay-клиента: URL, заголовок, payload, таймаут и нормализация ошибок.
- Тесты relay endpoint: авторизация, ограничения тела, schema, конфигурация и Telegram-ошибки.
- Тесты `/api/contact` для выбора relay на VPS и прямого Telegram fallback.
- Полный прогон тестов, typecheck, lint и build.
- После автодеплоя Netlify проверяется relay endpoint, затем на VPS добавляются URL/секрет, выполняются pull/build/restart и тестовая заявка.

