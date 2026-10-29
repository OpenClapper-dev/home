#!/usr/bin/env bash
# `pnpm typecheck`: tsc in every package with a tsconfig. The Worker type-checks against wrangler's
# generated runtime types (gitignored); they are generated here when missing (`make init` also does it).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

[ -f apps/site/worker-configuration.d.ts ] || pnpm -C apps/site types >/dev/null

for p in packages/vocab packages/ui apps/site apps/site/test apps/site/ui; do
  echo "tsc $p"
  (cd "$p" && npx tsc -p .)
done
