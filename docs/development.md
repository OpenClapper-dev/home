# Development

```sh
make init    # writes apps/site/.dev.vars (ADMIN_DEV_BYPASS, the Turnstile test secret), the Worker types, the local D1 schema
make dev     # Worker on :8787, page on :5173 (Vite proxies /api and /admin/api to the Worker)
```

Locally there is no Access: `/admin/` is open (`admin@localhost`). The forms use Cloudflare's visible
Turnstile test key, which always passes. The confirmation mail is not sent: `wrangler dev` simulates the
`send_email` binding and logs the message (with a path to its text) in the Worker's output; copy the
link from there to confirm.

## Checks (run before every commit)

```sh
make check          # = pnpm check: lint, typecheck, test, build, in that order
pnpm lint           # oxlint, config in .oxlintrc.json
pnpm typecheck      # scripts/typecheck.sh: tsc in packages/vocab, packages/ui, apps/site, apps/site/test, apps/site/ui
pnpm test           # packages/vocab (node --test), apps/site (vitest in workerd: every route)
pnpm build          # scripts/build-check.sh: vite build, csp-hash --check, wrangler deploy --dry-run
```

CI (`.github/workflows/ci.yml`) runs the same four as jobs on every PR and push to main; they are meant
as required checks on main. Lint findings are fixed in the code; a rule that only produces false
positives is switched off in `.oxlintrc.json` with a one-line reason.

Changing the inline theme script in an HTML file changes its CSP hash: `node scripts/csp-hash.mjs`
prints it, `apps/site/ui/public/_headers` carries it.

After changing `wrangler.jsonc`, regenerate the types: `pnpm -C apps/site types`.
