#!/bin/sh
set -eu

require_env() {
  name="$1"
  val="$(eval "printf '%s' \"\${$name:-}\"")"
  if [ -z "$val" ]; then
    echo "$name env var is required"
    exit 1
  fi
}

ensure_sslmode() {
  addr="$1"
  # If sslmode already present - keep as is.
  echo "$addr" | grep -q 'sslmode=' && { echo "$addr"; return; }
  echo "$addr" | grep -q '?' && { echo "${addr}&sslmode=require"; return; }
  echo "${addr}?sslmode=require"
}

to_nakama_db_addr() {
  # Preferred: already in Nakama format: user:pass@host:port/db?sslmode=...
  if [ -n "${NAKAMA_DATABASE_ADDRESS:-}" ]; then
    ensure_sslmode "${NAKAMA_DATABASE_ADDRESS}"
    return
  fi

  # Railway managed Postgres обычно даёт DATABASE_URL вида postgresql://user:pass@host:port/db?...
  if [ -n "${DATABASE_URL:-}" ]; then
    case "$DATABASE_URL" in
      postgres://*|postgresql://*)
        stripped="${DATABASE_URL#postgres://}"
        stripped="${stripped#postgresql://}"
        ensure_sslmode "$stripped"
        return
        ;;
    esac
  fi

  # Fallback: PG* variables.
  if [ -n "${PGHOST:-}" ] && [ -n "${PGPORT:-}" ] && [ -n "${PGUSER:-}" ] && [ -n "${PGPASSWORD:-}" ] && [ -n "${PGDATABASE:-}" ]; then
    ensure_sslmode "${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${PGDATABASE}"
    return
  fi

  # Fallback: explicit NAKAMA_DB_* variables.
  if [ -n "${NAKAMA_DB_HOST:-}" ] && [ -n "${NAKAMA_DB_PORT:-}" ] && [ -n "${NAKAMA_DB_USER:-}" ] && [ -n "${NAKAMA_DB_PASSWORD:-}" ] && [ -n "${NAKAMA_DB_NAME:-}" ]; then
    ensure_sslmode "${NAKAMA_DB_USER}:${NAKAMA_DB_PASSWORD}@${NAKAMA_DB_HOST}:${NAKAMA_DB_PORT}/${NAKAMA_DB_NAME}"
    return
  fi

  echo "Database connection is not configured. Set one of: NAKAMA_DATABASE_ADDRESS, DATABASE_URL, PG* vars, or NAKAMA_DB_* vars."
  exit 1
}

DB_ADDR="$(to_nakama_db_addr)"
SERVER_KEY="${NAKAMA_SERVER_KEY:-ludowars_dev_key}"
LOGGER_LEVEL="${NAKAMA_LOGGER_LEVEL:-INFO}"

echo "Running Nakama migrations..."
/nakama/nakama migrate up --database.address "$DB_ADDR"

echo "Starting Nakama..."
exec /nakama/nakama \
  --name "${NAKAMA_NAME:-nakama}" \
  --database.address "$DB_ADDR" \
  --logger.level "$LOGGER_LEVEL" \
  --session.token_expiry_sec "${NAKAMA_SESSION_TOKEN_EXPIRY_SEC:-7200}" \
  --socket.server_key "$SERVER_KEY" \
  --runtime.path /nakama/data/modules

