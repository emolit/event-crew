# Админ-панель EVENT CREW: установка и эксплуатация

## Требования и каталоги

- Node.js 22.22 или новее, Nginx и systemd.
- Код: `/var/www/event-crew`, пользователь и группа: `eventcrew`.
- База, загрузки и резервные копии: `/var/lib/event-crew`.
- Перед обновлением всегда создавайте резервную копию.

В `/var/www/event-crew/.env.local` должны быть:

```dotenv
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://eventcrw.com
EVENT_CREW_DATA_DIR=/var/lib/event-crew
SESSION_SECRET=СЛУЧАЙНАЯ_СТРОКА_НЕ_КОРОЧЕ_64_СИМВОЛОВ
```

Создать `SESSION_SECRET` можно командой `openssl rand -hex 64`. Файл должен принадлежать `eventcrew:eventcrew` и иметь права `600`. Пароль администратора в `.env.local` не хранится.

## Приём заявок через Web3Forms

Публичная форма отправляет заявки из браузера напрямую в Web3Forms, поэтому SMTP, Telegram и Netlify-шлюз для её работы не нужны. Заявки приходят на подтверждённый адрес `eventcrew@bk.ru`. Form Access Key публичен по модели Web3Forms и не предоставляет доступ к почте или кабинету.

После публикации отправьте одну тестовую заявку с `https://eventcrw.com` и проверьте папки «Входящие» и «Спам». Управление формой и статистика доступны в кабинете Web3Forms.

## Резервный серверный маршрут (публичной формой не используется)

Старый `/api/contact` и защищённый Netlify endpoint сохранены в коде как резерв. Если их потребуется включить отдельно, в Netlify для сайта `magical-stroopwafel-621e60` добавьте Environment Variables:

```dotenv
TELEGRAM_BOT_TOKEN=ТОКЕН_ОТ_BOTFATHER
TELEGRAM_CHAT_ID=-1001234567890
CONTACT_RELAY_SECRET=ОДИНАКОВЫЙ_СЛУЧАЙНЫЙ_СЕКРЕТ
```

На Netlify не задавайте `CONTACT_RELAY_URL`: endpoint должен обращаться к Telegram напрямую. После изменения переменных запустите новый deploy.

ID группы получите через Bot API с компьютера, где доступен Telegram: добавьте бота в закрытую группу, отправьте `/start@имя_бота`, вызовите `getUpdates` и возьмите отрицательное значение `message.chat.id` или `my_chat_member.chat.id`. Токен не публикуйте и не передавайте в переписке.

На VPS сохраните URL и тот же relay secret, удалив неиспользуемые Telegram/SMTP credentials:

```bash
cd /var/www/event-crew

read -rsp 'Вставьте CONTACT_RELAY_SECRET из Netlify: ' CONTACT_RELAY_SECRET
printf '\n'
sed -i '/^CONTACT_RELAY_URL=/d;/^CONTACT_RELAY_SECRET=/d;/^TELEGRAM_/d;/^SMTP_/d;/^CONTACT_RECIPIENT_EMAIL=/d' .env.local
printf '\nCONTACT_RELAY_URL=%s\nCONTACT_RELAY_SECRET=%s\n' \
  'https://magical-stroopwafel-621e60.netlify.app/api/contact/relay' \
  "$CONTACT_RELAY_SECRET" >> .env.local
chown eventcrew:eventcrew .env.local
chmod 600 .env.local
unset CONTACT_RELAY_SECRET
```

Relay endpoint принимает только `POST` с правильным Bearer secret, повторно проверяет тело заявки и не раскрывает Telegram credentials. После обновления кода, сборки и перезапуска VPS отправьте тестовую заявку с сайта; она должна появиться в закрытой группе.

Nginx должен перезаписывать клиентский адрес и разрешать общий multipart-запрос до 50 МБ (каждый файл приложение всё равно ограничивает 12 МБ):

```nginx
client_max_body_size 50m;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

## Первое включение

```bash
install -d -o eventcrew -g eventcrew -m 700 /var/lib/event-crew
cd /var/www/event-crew
runuser -u eventcrew -- npm ci
runuser -u eventcrew -- npm run content:seed
runuser -u eventcrew -- npm run admin:create
runuser -u eventcrew -- npm run build
systemctl restart event-crew
```

`admin:create` запросит логин и скрытый пароль. Для смены пароля используйте `npm run admin:create -- --reset`.

## Ежедневные резервные копии

```bash
cp deploy/systemd/event-crew-backup.{service,timer} /etc/systemd/system/
cp deploy/systemd/event-crew-purge.{service,timer} /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now event-crew-backup.timer event-crew-purge.timer
systemctl start event-crew-backup.service
systemctl status event-crew-backup.service --no-pager
ls -lah /var/lib/event-crew/backups
```

Архив включает согласованный снимок SQLite, загрузки и SHA-256 суммы. Хранятся последние 30 успешных архивов; неудачная попытка не удаляет предыдущие.

## Проверка восстановления

Не восстанавливайте рабочую базу для проверки. Используйте отдельный каталог:

```bash
install -d -o eventcrew -g eventcrew -m 700 /var/lib/event-crew-restore-test
BACKUP=$(ls -1t /var/lib/event-crew/backups/*.ecbackup | head -n 1)
EVENT_CREW_DATA_DIR=/var/lib/event-crew-restore-test runuser -u eventcrew -- npm run restore-backup -- "$BACKUP"
ls -lah /var/lib/event-crew-restore-test
```

Для реального восстановления остановите сайт, сохраните копию текущего каталога и используйте `--force`:

```bash
systemctl stop event-crew
cp -a /var/lib/event-crew "/var/lib/event-crew.before-restore-$(date +%Y%m%d-%H%M%S)"
runuser -u eventcrew -- npm run restore-backup -- /var/lib/event-crew/backups/ИМЯ.ecbackup --force
systemctl start event-crew
curl -I https://eventcrw.com
```

## Обычное обновление с GitHub

```bash
cd /var/www/event-crew
runuser -u eventcrew -- npm run backup
runuser -u eventcrew -- git pull --ff-only
runuser -u eventcrew -- npm ci
runuser -u eventcrew -- npm run content:seed
runuser -u eventcrew -- npm run build
systemctl restart event-crew
systemctl --no-pager --full status event-crew
curl -I https://eventcrw.com
```

Если сборка или проверка сайта не прошла, верните предыдущий Git-коммит, выполните `npm ci`, `npm run build` и перезапустите сервис. При повреждении данных восстановите последний проверенный архив по инструкции выше.
