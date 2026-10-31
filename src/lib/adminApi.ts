const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const TOKEN_KEY = "personal-site-admin-token";

function normalizeAdminPath(value: string | undefined): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "/admin-secure4303";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.replace(/\/+$/, "") || "/admin-secure4303";
}

export const ADMIN_PATH: string = normalizeAdminPath(
  import.meta.env.VITE_ADMIN_PATH,
);

export const UNAUTHORIZED_EVENT = "admin:unauthorized";

export type AdminRow = Record<string, unknown>;

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

export function getAdminToken(): string {
  try {
    return window.sessionStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setAdminToken(token: string): void {
  try {
    window.sessionStorage.setItem(TOKEN_KEY, token.trim());
  } catch {
    return;
  }
}

export function clearAdminToken(): void {
  try {
    window.sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    return;
  }
}

export function tokenFromUrlHash(): string {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return "";
  const token = new URLSearchParams(raw).get("token")?.trim() ?? "";
  if (token) {
    window.history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }
  return token;
}

function extractDetail(body: unknown): string | null {
  if (!body || typeof body !== "object" || !("detail" in body)) return null;
  const detail = (body as { detail: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          return String((item as { msg: unknown }).msg);
        }
        return String(item);
      })
      .join(", ");
  }
  return null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getAdminToken();
  if (token) headers.set("X-Admin-Token", token);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401) {
    clearAdminToken();
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new AdminApiError(
      extractDetail(body) ?? `Request failed with status ${response.status}.`,
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function json(method: string, data?: unknown): RequestInit {
  return {
    method,
    body: data === undefined ? undefined : JSON.stringify(data),
  };
}

const ADMIN_BASE = "/admin";

function resourcePath(resource: string): string {
  return `${ADMIN_BASE}/${resource}`;
}

export const adminApi = {
  verify: () => request<AdminRow>(`${ADMIN_BASE}/home`),

  getHome: () => request<AdminRow>(`${ADMIN_BASE}/home`),
  updateHome: (data: AdminRow) =>
    request<AdminRow>(`${ADMIN_BASE}/home`, json("PATCH", data)),

  getResume: () => request<AdminRow>(`${ADMIN_BASE}/resume`),
  updateResume: (data: AdminRow) =>
    request<AdminRow>(`${ADMIN_BASE}/resume`, json("PATCH", data)),

  list: (resource: string) => request<AdminRow[]>(resourcePath(resource)),

  create: (resource: string, data: AdminRow) =>
    request<AdminRow>(resourcePath(resource), json("POST", data)),

  update: (resource: string, id: number, data: AdminRow) =>
    request<AdminRow>(`${resourcePath(resource)}/${id}`, json("PATCH", data)),

  remove: (resource: string, id: number) =>
    request<{ detail: string }>(`${resourcePath(resource)}/${id}`, {
      method: "DELETE",
    }),

  upload: (file: File, folder: string) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ path: string; url: string }>(
      `${ADMIN_BASE}/uploads?folder=${encodeURIComponent(folder)}`,
      { method: "POST", body },
    );
  },
};

export function errorMessage(error: unknown): string {
  if (error instanceof AdminApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong.";
}
