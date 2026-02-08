#!/bin/sh
set -eu

if [ -z "${PORT:-}" ]; then
  echo "PORT env var is required"
  exit 1
fi

if [ -z "${UPSTREAM_HOST:-}" ]; then
  echo "UPSTREAM_HOST env var is required"
  exit 1
fi

UPSTREAM_PORT="${UPSTREAM_PORT:-7351}"

TEMPLATE="/etc/nginx/templates/nginx.noauth.conf.template"
if [ -n "${BASIC_AUTH_USER:-}" ]; then
  if [ -z "${BASIC_AUTH_PASSWORD:-}" ]; then
    echo "BASIC_AUTH_PASSWORD env var is required when BASIC_AUTH_USER is set"
    exit 1
  fi

  # Generate htpasswd file for nginx basic auth
  HASH="$(openssl passwd -apr1 "${BASIC_AUTH_PASSWORD}")"
  printf "%s:%s\n" "${BASIC_AUTH_USER}" "${HASH}" > /etc/nginx/.htpasswd
  TEMPLATE="/etc/nginx/templates/nginx.auth.conf.template"
fi

export PORT UPSTREAM_HOST UPSTREAM_PORT
envsubst '${PORT} ${UPSTREAM_HOST} ${UPSTREAM_PORT}' < "${TEMPLATE}" > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'

