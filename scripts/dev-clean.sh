#!/usr/bin/env bash
# 释放本机 3000 端口后再启动 Astro，避免 Vite 自动改用 3001/3002…
set -euo pipefail
PORT="${PORT:-3000}"
if command -v fuser >/dev/null 2>&1; then
  fuser -k "${PORT}/tcp" 2>/dev/null || true
elif command -v lsof >/dev/null 2>&1; then
  if PIDS=$(lsof -ti:"${PORT}" -sTCP:LISTEN 2>/dev/null); then
    kill -9 ${PIDS} 2>/dev/null || true
  fi
fi
exec pnpm exec astro dev
