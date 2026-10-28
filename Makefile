# The local development stack: thin wrappers around the pnpm scripts in package.json, which stay the
# source of truth. Deploying is not here: it runs from GitHub Actions (docs/deploying.md).
.PHONY: help init check dev

help: ## Show this list
	@grep -hE '^[a-z-]+:.*?## ' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "} {printf "  make %-8s %s\n", $$1, $$2}'

init: ## Write the gitignored dev files, generate the Worker types and apply D1 migrations locally (once per checkout)
	pnpm dev:init

check: ## The CI lane: lint, typecheck, unit and route tests, build dry runs
	pnpm check

dev: ## Worker on :8787 (local D1, no Access: admin@localhost) and the page on :5173
	pnpm dev
