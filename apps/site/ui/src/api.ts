/** The Worker's public API (apps/site/src/forms.ts); same origin. A 400 carries the field it is about. */
export class ApiError extends Error {
  status: number;
  field: string | null;
  constructor(status: number, message: string, field: string | null = null) { super(message); this.status = status; this.field = field; }
}

export async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json", accept: "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => null)) as ({ error?: string; field?: string } & T) | null;
  if (!res.ok) throw new ApiError(res.status, data?.error ?? `HTTP ${res.status}`, data?.field ?? null);
  return data as T;
}
