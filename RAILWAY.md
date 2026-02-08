# Railway деплой (монорепа: `frontend/` + `backend/` + Postgres)

Этот проект деплоится на Railway **без CLI**: подключаете GitHub репозиторий и Railway делает автодеплой на каждый push в выбранную ветку.

## 1) Сервисы в Railway Project

- **Postgres**: managed PostgreSQL (Railway → Add Service → Database → PostgreSQL)
- **Nakama**: сервис из `backend/` (Dockerfile)
- **Frontend**: сервис из `frontend/` (Nixpacks/Node)
- **Console Proxy (опционально, но рекомендуется для публичной консоли)**: сервис из `console-proxy/`

## 2) Frontend сервис (`frontend/`)

### Root Directory
- `frontend/`

### Важно про builder
Если Railpack/Nixpacks не может корректно определить сборку (часто в монорепах), переключите **Frontend сервис на Docker builder** и укажите Dockerfile: `frontend/Dockerfile.railway`.

Альтернатива (если Railway всё равно анализирует корень репо): в корне репозитория есть `package.json`, который делегирует `build/start` в `frontend/`. Тогда можно деплоить сервис вообще без Root Directory.

### Переменные окружения (Vite читает их на build-time)
- `VITE_NAKAMA_HOST`: домен Nakama сервиса (например `xxx.up.railway.app`)
- `VITE_NAKAMA_USE_SSL`: `true`
- `VITE_NAKAMA_PORT`: `443`
- `VITE_NAKAMA_SERVER_KEY`: ваш server key (если не задан — в коде есть дефолт `ludowars_dev_key`)

Важно: если фронт деплоится **через Dockerfile**, эти переменные должны быть доступны **во время `docker build`**.
В `frontend/Dockerfile.railway` они объявлены как `ARG` и прокидываются в `ENV`, поэтому в Railway UI добавьте их в **Build Args**.

### Команды
Если Railway не подхватит автоматически:
- **Build**: `npm ci && npm run build`
- **Start**: `npm start`

В `frontend/package.json` уже добавлен `start`, который запускает `serve -s dist -l $PORT`.

## 3) Nakama сервис (`backend/`)

### Root Directory
- `backend/`

### Build
- Dockerfile: `backend/Dockerfile` (собирает Go-плагин `backend.so` и кладёт в образ `heroiclabs/nakama`)

### Переменные окружения
Заведите (или используйте те, что даст Railway Postgres):
- `NAKAMA_DB_HOST`
- `NAKAMA_DB_PORT`
- `NAKAMA_DB_USER`
- `NAKAMA_DB_PASSWORD`
- `NAKAMA_DB_NAME`
- `NAKAMA_SERVER_KEY` (секрет)

### Start Command (миграции + запуск)
Вариант 1 (рекомендуется): **не задавать Start Command** в UI. В `backend/Dockerfile` уже добавлен `ENTRYPOINT` (`backend/entrypoint.sh`), который:
- собирает строку подключения из `DATABASE_URL` или `PG*` или `NAKAMA_DB_*`
- делает `nakama migrate up`
- запускает Nakama с нужными флагами

Вариант 2: в Railway UI для Nakama сервиса задать **Start Command** (если хотите управлять из UI):

```bash
/bin/sh -ec '
  DB_ADDR="${NAKAMA_DB_USER}:${NAKAMA_DB_PASSWORD}@${NAKAMA_DB_HOST}:${NAKAMA_DB_PORT}/${NAKAMA_DB_NAME}?sslmode=require";
  /nakama/nakama migrate up --database.address "$DB_ADDR";
  exec /nakama/nakama \
    --name nakama \
    --database.address "$DB_ADDR" \
    --logger.level DEBUG \
    --session.token_expiry_sec 7200 \
    --socket.server_key "$NAKAMA_SERVER_KEY" \
    --runtime.path /nakama/data/modules
'
```

Примечание: для managed Postgres обычно нужен SSL, поэтому `sslmode=require`.

## 4) Публичная Nakama Console через proxy (`console-proxy/`)

Nakama Console слушает отдельный порт (обычно `7351`). Чтобы иметь **отдельный домен** для консоли и добавить защиту (Basic Auth), используйте сервис `console-proxy/`.

### Root Directory
- `console-proxy/`

### Переменные окружения
- `UPSTREAM_HOST` (обязательная): внутренний хост Nakama в сети Railway
- `UPSTREAM_PORT` (опциональная): по умолчанию `7351`
- `BASIC_AUTH_USER` (опционально): включит basic auth
- `BASIC_AUTH_PASSWORD` (обязательная, если задан `BASIC_AUTH_USER`)

### Как узнать `UPSTREAM_HOST`
Самый простой путь: в Railway UI в Nakama сервисе найти **Private Domain / Private URL** (или аналогичное поле) и использовать его как `UPSTREAM_HOST` (без `https://`), либо задать внутренний hostname, который Railway даёт для сервиса.

## 5) Автодеплой

- В каждом сервисе выбираете **Production Branch** (например `railway`).
- Включаете **Deploy on Push** (обычно включено по умолчанию).
- После этого любой `git push` в эту ветку триггерит деплой.

