# EVENT CREW redesign report

Дата: 17 августа 2026

## Результат

- Страница получила направление production board с фирменной жёлтой crew line.
- Подключены Roboto Condensed и Manrope через `next/font` с кириллицей.
- Hero, roster услуг, контрольный лист, проекты, тайминг, форма и подвал пересобраны на общей 4 px системе.
- Все фотографии остались локальными. Пути для быстрой замены находятся в `data/site.ts`, `data/services.ts` и `data/projects.ts`.
- Сохранены focus trap мобильного меню, валидация, Telegram API, rate limit и состояния формы.
- Тексты прошли stop-slop аудит. Удалены рекламные клише, безличные обещания и конструкции с длинным тире.

## Проверка

- `npm run test:run`: 12 файлов, 65 тестов, PASS.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run build`: PASS.
- Next.js routes: `/` static, `/_not-found` static, `/api/contact` dynamic.
- Static scan: нет `transition: all`, декоративных gradients и запрещённых рекламных формулировок.
- Stop-slop: directness 10, rhythm 8, trust 9, authenticity 9, density 9. Итого 45/50.

## Дизайн-проверки

- Swap: замена Roboto Condensed на системный шрифт убирает production-характер заголовков.
- Squint: hero headline, фотография и CTA формируют один главный маршрут.
- Signature: crew line используется в hero, заголовках секций, roster, timeline и форме.
- Token: брендовые цвета берутся из семантических переменных; signal red используется только для ошибок.

## Ограничение проверки

Встроенный браузер не подключился из-за ошибки локального канала. Production build, DOM-тесты и сервер на `http://localhost:3100/` работают. Визуальную проверку в приложении нужно выполнить вручную после открытия этого адреса.
