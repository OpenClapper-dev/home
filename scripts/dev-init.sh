#!/usr/bin/env bash
# `make init`: the gitignored local files and the local D1 schema. Safe to run again.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [ ! -f apps/site/.dev.vars ]; then
  cat > apps/site/.dev.vars <<'VARS'
# Local development only (gitignored). No Access in front of /admin: every request there is admin@localhost.
ADMIN_DEV_BYPASS=true
# Cloudflare's Turnstile test secret: siteverify always passes (the page uses the matching test site key).
TURNSTILE_SECRET=1x0000000000000000000000000000000AA
VARS
  echo "wrote apps/site/.dev.vars"
fi
pnpm -C apps/site types >/dev/null && echo "generated apps/site/worker-configuration.d.ts"
pnpm -C apps/site exec wrangler d1 migrations apply DB --local
