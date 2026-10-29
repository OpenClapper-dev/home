/** The router and the JSON helpers, as in core's packages/service-kit (copied, trimmed to what this Worker uses). */
export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Every API answer: never cached, never sniffed as anything but JSON, no full URL in a Referer. */
export const API_HEADERS: Readonly<Record<string, string>> = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "referrer-policy": "same-origin",
};

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...API_HEADERS, ...headers },
  });
}

/** `application/json` exactly, parameters (charset) allowed. */
export function isJsonType(contentType: string | null): boolean {
  return (contentType ?? "").split(";")[0].trim().toLowerCase() === "application/json";
}

export async function readJson<T>(request: Request, maxBytes = 256 * 1024): Promise<T> {
  if (!isJsonType(request.headers.get("content-type"))) throw new HttpError(415, "expected application/json");
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > maxBytes) throw new HttpError(413, "body too large");
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, "body too large");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new HttpError(400, "invalid JSON body");
  }
}

export function assertEnum<T extends readonly string[]>(v: unknown, field: string, list: T): T[number] {
  if (typeof v !== "string" || !(list as readonly string[]).includes(v)) throw new HttpError(400, `${field} must be one of: ${list.join(", ")}`);
  return v;
}

/** A path parameter; a malformed `%` sequence is the client's mistake (400), not a URIError (500). */
function decodeSegment(seg: string): string {
  try {
    return decodeURIComponent(seg);
  } catch {
    throw new HttpError(400, "malformed path");
  }
}

/** Minimal method+pattern router. Patterns use `:name` segments. */
export type Handler<Ctx> = (ctx: Ctx, params: Record<string, string>) => Promise<Response>;

export class Router<Ctx> {
  private routes: { method: string; pattern: string; parts: string[]; handler: Handler<Ctx> }[] = [];

  on(method: string, pattern: string, handler: Handler<Ctx>): this {
    this.routes.push({ method, pattern, parts: pattern.split("/").filter(Boolean), handler });
    return this;
  }

  /** The registered routes, read-only: the route tests enumerate them so a new route cannot go untested. */
  list(): { method: string; pattern: string }[] {
    return this.routes.map(({ method, pattern }) => ({ method, pattern }));
  }

  async handle(method: string, pathname: string, ctx: Ctx): Promise<Response> {
    if (method === "HEAD") method = "GET";
    const segs = pathname.split("/").filter(Boolean);
    let pathMatched = false;
    for (const r of this.routes) {
      if (r.parts.length !== segs.length) continue;
      const params: Record<string, string> = {};
      let ok = true;
      for (let i = 0; i < segs.length; i++) {
        if (r.parts[i].startsWith(":")) params[r.parts[i].slice(1)] = decodeSegment(segs[i]);
        else if (r.parts[i] !== segs[i]) { ok = false; break; }
      }
      if (!ok) continue;
      pathMatched = true;
      if (r.method === method) return r.handler(ctx, params);
    }
    throw new HttpError(pathMatched ? 405 : 404, pathMatched ? "method not allowed" : "not found");
  }
}
