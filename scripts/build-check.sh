#!/usr/bin/env bash
# `pnpm build`: build dry runs, nothing is deployed. The Vite build comes first: the Worker serves it
# as assets (assets.directory), so its dry run needs the output to exist. The Worker dry run uses the
# tracked local wrangler.jsonc (no account, no token).
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/.."

out="$(mktemp -d)"
trap 'rm -rf "$out"' EXIT

(cd apps/site && npx vite build)
node scripts/csp-hash.mjs --check   # the CSP in public/_headers still allows the inline theme script
(cd apps/site && npx wrangler deploy --dry-run --outdir "$out/site")
