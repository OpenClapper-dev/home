/**
 * openclapper.org in one Worker: the static page (Workers assets), the forms' API under /api, and the
 * owner's admin view under /admin. /admin, API and page alike, is reachable only through the Cloudflare
 * Access application on that path: the Worker verifies the Access JWT before it serves anything there.
 */
import { AccessError, verifyAccessJwt } from "./access.ts";
import { registerAdmin } from "./admin.ts";
import { registerForms } from "./forms.ts";
import { HttpError, json, Router } from "./http.ts";
import type { Mailer } from "./mail.ts";

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
  EMAIL: Mailer;
  ACCESS_TEAM_DOMAIN: string;
  ACCESS_AUD: string;
  SITE_URL: string;
  MAIL_FROM: string;
  /** Secret: the Turnstile widget's secret key. Without it every form submission is refused. */
  TURNSTILE_SECRET?: string;
  /**
   * Local development only (gitignored `.dev.vars`): no Access in front of /admin, every request there is
   * `admin@localhost`. Honoured only for requests to localhost / 127.0.0.1, so a var set by mistake on a
   * deployment opens nothing.
   */
  ADMIN_DEV_BYPASS?: string;
}

export interface Ctx {
  env: Env;
  request: Request;
  url: URL;
  /** The operator, from the Access JWT; "" outside /admin. */
  admin: string;
  /** Local development (ADMIN_DEV_BYPASS, on localhost): no Access, and Turnstile's test key is accepted. */
  local: boolean;
}

export const router = new Router<Ctx>();
registerForms(router);
registerAdmin(router);

const isLocal = (url: URL) => url.hostname === "localhost" || url.hostname === "127.0.0.1";

async function operator(request: Request, local: boolean, env: Env): Promise<string> {
  if (local) return "admin@localhost";
  const id = await verifyAccessJwt(request, env);
  return id.email || `service:${id.serviceTokenId}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isAdmin = url.pathname === "/admin" || url.pathname.startsWith("/admin/");
    const local = env.ADMIN_DEV_BYPASS === "true" && isLocal(url);
    try {
      let admin = "";
      if (isAdmin) {
        try {
          admin = await operator(request, local, env);
        } catch (err) {
          // The reason goes to the log only: it would tell a prober which check to work on.
          if (err instanceof AccessError) {
            console.warn(`admin: refused (${err.message})`);
            return json({ error: "unauthorized" }, 401);
          }
          throw err;
        }
        // The admin page itself: a static asset, served only after the check above.
        if (!url.pathname.startsWith("/admin/api/")) return env.ASSETS.fetch(request);
      }
      return await router.handle(request.method, url.pathname, { env, request, url, admin, local });
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      console.error("unhandled", err);
      return json({ error: "internal error" }, 500);
    }
  },
} satisfies ExportedHandler<Env>;
