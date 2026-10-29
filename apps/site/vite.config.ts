import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { version } from "../../package.json";

const commit = (() => { try { return execFileSync("git", ["rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim(); } catch { return "dev"; } })();
const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// The Turnstile site key is baked into the page: the deploy sets TURNSTILE_SITEKEY; locally and in CI
// it is Cloudflare's visible test key, which always passes (its secret is in .dev.vars, scripts/dev-init.sh).
const sitekey = process.env.TURNSTILE_SITEKEY || "1x00000000000000000000AA";

// @openclapper/home-ui lives outside this root, where Vite watches single files; watching the folder survives a branch switch.
const uiSrc = here("../../packages/ui/src");
const watchUi = { name: "home-watch-ui", configureServer(server: { watcher: { add(path: string): unknown } }) { server.watcher.add(uiSrc); } };

export default defineConfig({
  root: "ui",
  plugins: [preact(), watchUi],
  define: { __HOME_VERSION__: JSON.stringify(version), __HOME_COMMIT__: JSON.stringify(commit), __TURNSTILE_SITEKEY__: JSON.stringify(sitekey) },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: { input: { index: here("ui/index.html"), privacy: here("ui/privacy.html"), admin: here("ui/admin/index.html") } },
  },
  // Local dev: the Worker (`pnpm -C apps/site dev:worker`, ADMIN_DEV_BYPASS on) on :8790.
  server: { port: 5180, strictPort: true, proxy: { "/api": "http://localhost:8790", "/admin/api": "http://localhost:8790" } },
});
