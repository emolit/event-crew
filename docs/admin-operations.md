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

Создать секрет можно командой `openssl rand -hex 64`. Файл должен принадлежать `eventcrew:eventcrew` и иметь права `600`. Пароль администратора в `.env.local` не хранится.

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
