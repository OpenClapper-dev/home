import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

/** The Worker's route tests: in workerd, on the real schema, with the mail and Turnstile calls stubbed. */
export default defineConfig(async () => {
  const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
  // wrangler.jsonc serves the page's build as assets; the tests only call the API, but the directory has to exist.
  mkdirSync(here("dist"), { recursive: true });
  return {
    plugins: [
      cloudflareTest({
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: { bindings: { TEST_MIGRATIONS: await readD1Migrations(here("migrations")) } },
      }),
    ],
    test: { include: ["test/**/*.test.ts"], setupFiles: ["./test/setup.ts"] },
  };
});
