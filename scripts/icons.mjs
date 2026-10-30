// Builds the site's icons from OpenClapper's icon geometry (core: references/logo-redesign/build-icons.mjs,
// issue #249; the geometry below is copied from there, unchanged). Outputs, in apps/site/ui/public/icons:
// the organisation mark as favicon.svg, icon-192.png, icon-512.png and og-1024.png, and the three app
// tiles (studio.svg, phone.svg, admin.svg) for the page's cards. Run from the repository root with the
// core checkout beside it (it borrows core's sharp): node scripts/icons.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const root = process.cwd();
const corePnpm = path.join(root, "../core/node_modules/.pnpm");
const sharpDir = fs.existsSync(corePnpm) && fs.readdirSync(corePnpm).filter((d) => d.startsWith("sharp@")).sort().pop();
if (!sharpDir) { console.error("icons: needs ../core with its node_modules (sharp)"); process.exit(1); }
const sharp = createRequire(import.meta.url)(path.join(corePnpm, sharpDir, "node_modules/sharp"));

const BLUE = "#1E3FBF";
const f2 = (v) => +v.toFixed(2);
const rr = (x, y, w, h, r) => `M${f2(x + r)} ${f2(y)}H${f2(x + w - r)}A${r} ${r} 0 0 1 ${f2(x + w)} ${f2(y + r)}V${f2(y + h - r)}A${r} ${r} 0 0 1 ${f2(x + w - r)} ${f2(y + h)}H${f2(x + r)}A${r} ${r} 0 0 1 ${f2(x)} ${f2(y + h - r)}V${f2(y + r)}A${r} ${r} 0 0 1 ${f2(x + r)} ${f2(y)}Z`;
const circle = (cx, cy, r) => `M${f2(cx - r)} ${f2(cy)}a${r} ${r} 0 1 0 ${f2(2 * r)} 0a${r} ${r} 0 1 0 ${f2(-2 * r)} 0Z`;
const poly = (P) => "M" + P.map((p) => p.map(f2).join(" ")).join("L") + "Z";
const rot = (deg, px, py) => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return ([X, Y]) => [px + (X - px) * c - (Y - py) * s, py + (X - px) * s + (Y - py) * c]; };
function clipX(P, x0, x1) {
  const clip = (P, keep, cross) => { const out = []; for (let i = 0; i < P.length; i++) { const A = P[i], B = P[(i + 1) % P.length], ia = keep(A), ib = keep(B); if (ia) out.push(A); if (ia !== ib) out.push(cross(A, B)); } return out; };
  const at = (x) => (A, B) => [x, A[1] + ((B[1] - A[1]) * (x - A[0])) / (B[0] - A[0])];
  return clip(clip(P, (p) => p[0] >= x0, at(x0)), (p) => p[0] <= x1, at(x1));
}
const area = (P) => Math.abs(P.reduce((a, [x1, y1], i) => { const [x2, y2] = P[(i + 1) % P.length]; return a + x1 * y2 - x2 * y1; }, 0)) / 2;
function stick(x, y, w, h, n, deg, px, py, { slant = h * 0.8, gap = 0.42, phase = 0.3 } = {}) {
  const R = rot(deg, px, py), pitch = w / n, gw = pitch * gap, sw = pitch - gw;
  const parts = [];
  for (let i = -1; i <= n + 1; i++) {
    const sx = x + i * pitch + phase * pitch + gw;
    const P = clipX([[sx, y + h], [sx + slant, y], [sx + slant + sw, y], [sx + sw, y + h]], x, x + w);
    if (P.length >= 3 && area(P) > 0.3 * sw * h) parts.push(poly(P.map(R)));
  }
  return parts.join(" ");
}
const BX = 14, BY = 26;
const MARK = [rr(BX, BY, 86, 74, 5), stick(BX, BY - 11.5, 70 * 1.4, 11, 7 * 1.4, -24, BX, BY), circle(BX + 4, BY + 3, 2.4)].join(" ");
const G = [43, 49.5, 32];
const glyph = {
  window(cx, cy, s) { const w = s, h = s * 0.78, x = cx - w / 2, y = cy - h / 2, t = s * 0.1, bar = s * 0.2; return rr(x, y, w, h, f2(s * 0.1)) + ` M${f2(x + t)} ${f2(y + bar)}H${f2(x + w - t)}V${f2(y + h - t)}H${f2(x + t)}Z`; },
  phone(cx, cy, s) { const w = s * 0.52, h = s, x = cx - w / 2, y = cy - h / 2; return rr(x, y, w, h, f2(s * 0.12)) + " " + circle(cx, y + h * 0.26, f2(s * 0.11)); },
  shield(cx, cy, s) { const w = s * 0.8, h = s, x = cx - w / 2, y = cy - h / 2; return `M${f2(x)} ${f2(y + h * 0.12)}Q${f2(cx)} ${f2(y - h * 0.05)} ${f2(x + w)} ${f2(y + h * 0.12)}V${f2(y + h * 0.5)}Q${f2(x + w)} ${f2(y + h * 0.85)} ${f2(cx)} ${f2(y + h)}Q${f2(x)} ${f2(y + h * 0.85)} ${f2(x)} ${f2(y + h * 0.5)}Z ` + circle(cx, cy, f2(s * 0.14)); },
};
const SURFACES = { studio: glyph.window(...G), phone: glyph.phone(...G), admin: glyph.shield(...G), org: "" };
const markPath = (surface) => (MARK + " " + SURFACES[surface]).trim();
const FAV = { mark: ["M3 6H19V19H3Z", stick(3, 2.6, 20, 3.4, 4, -24, 3, 6, { gap: 0.45, phase: 0.15 })].join(" "), org: "" };

const svg = (vb, body, size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${size ? ` width="${size}" height="${size}"` : ""}>${body}</svg>`;
function tileSvg(surface, bg, { rx = 16, scale = 1, fg = "#FFFFFF", size } = {}) {
  const pad = (72 / scale - 72) / 2, vb = `${-pad} ${-pad} ${72 + 2 * pad} ${72 + 2 * pad}`;
  const shape = rx == null ? `<rect x="${-pad}" y="${-pad}" width="${72 + 2 * pad}" height="${72 + 2 * pad}"/>` : `<rect width="72" height="72" rx="${rx}"/>`;
  const fill = bg ? shape.replace("/>", ` fill="${bg}"/>`) : "";
  return svg(vb, `<defs><clipPath id="t">${shape}</clipPath></defs>${fill}<g clip-path="url(#t)"><path fill="${fg}" fill-rule="evenodd" d="${markPath(surface)}"/></g>`, size);
}
const favicon = (surface, bg) => svg("0 0 16 16", `<defs><clipPath id="t"><rect width="16" height="16" rx="3"/></clipPath></defs><rect width="16" height="16" rx="3" fill="${bg}"/><g clip-path="url(#t)"><path fill="#FFFFFF" fill-rule="evenodd" d="${(FAV.mark + " " + FAV[surface]).trim()}"/></g>`);
const png = async (svgText, px, out) => { await sharp(Buffer.from(svgText), { density: 72 * (px / 72) * 4 }).resize(px, px).png({ compressionLevel: 9 }).toFile(out); };

const out = path.join(root, "apps/site/ui/public/icons");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "favicon.svg"), favicon("org", BLUE) + "\n");
await png(tileSvg("org", BLUE), 192, path.join(out, "icon-192.png"));
await png(tileSvg("org", BLUE), 512, path.join(out, "icon-512.png"));
await png(tileSvg("org", BLUE, { rx: null, scale: 0.9 }), 1024, path.join(out, "og-1024.png"));
for (const s of ["studio", "phone", "admin"]) fs.writeFileSync(path.join(out, `${s}.svg`), tileSvg(s, BLUE) + "\n");
console.log("icons: wrote favicon.svg, icon-192.png, icon-512.png, og-1024.png, studio.svg, phone.svg, admin.svg");
