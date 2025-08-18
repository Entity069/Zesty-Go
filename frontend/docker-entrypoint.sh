#!/usr/bin/env sh
set -eu

envsubst '${VITE_BASE_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

exec "$@"