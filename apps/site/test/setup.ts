import { applyD1Migrations } from "cloudflare:test";
import { env } from "cloudflare:workers";

// Every test file has its own D1, on the migrations.
await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
