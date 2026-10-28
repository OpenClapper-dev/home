#!/usr/bin/env node
// The CSP of the pages (apps/site/ui/public/_headers) allows the one inline script of each HTML file
// (theme before first paint) by its SHA-256. Editing that script changes the hash:
//
//   node scripts/csp-hash.mjs            prints the hash of each page's inline scripts
//   node scripts/csp-hash.mjs --check    after `vite build`: fails when a built page has an inline
//                                        script whose hash is not in the built _headers (pnpm build runs it)
//
// The hash covers the script's text exactly as it stands between <script> and </script>.
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const pages = ["index.html", "privacy.html", "admin/index.html"];

const inlineScripts = (html) =>
  [...html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)].filter((m) => !/\ssrc=/.test(m[1] ?? "")).map((m) => m[2]);
const hash = (text) => `'sha256-${createHash("sha256").update(text, "utf8").digest("base64")}'`;

let failed = false;
const seen = new Set();
for (const page of pages) {
  const htmlPath = join(root, check ? "apps/site/dist" : "apps/site/ui", page);
  if (!existsSync(htmlPath)) { console.error(`csp-hash: ${htmlPath} missing${check ? " (run vite build first)" : ""}`); failed = true; continue; }
  const hashes = inlineScripts(readFileSync(htmlPath, "utf8")).map(hash);
  if (!check) { for (const h of hashes) if (!seen.has(h)) { seen.add(h); console.log(`${page}: ${h}`); } continue; }
  const headers = readFileSync(join(root, "apps/site/dist/_headers"), "utf8");
  for (const h of hashes) {
    if (!headers.includes(h)) {
      console.error(`csp-hash: ${page}: inline script ${h} is not allowed by _headers; update script-src (node scripts/csp-hash.mjs)`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
