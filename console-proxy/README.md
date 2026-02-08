# console-proxy

Небольшой reverse-proxy сервис для публикации Nakama Console (порт `7351`) отдельным доменом на Railway.

## Env vars

- `PORT` (обязательная): порт, который даёт Railway.
- `UPSTREAM_HOST` (обязательная): хост Nakama в приватной сети Railway (или любой достижимый хост).
- `UPSTREAM_PORT` (опциональная): порт upstream, по умолчанию `7351`.
- `BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` (опциональные): если заданы, включается Basic Auth.

## Notes

- Рекомендуется всегда включать Basic Auth и/или ограничение по IP (через Cloudflare Access / allowlist), иначе консоль будет доступна всему интернету.

