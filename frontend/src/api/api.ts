const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export default API_BASE;

// Token helpers
export const TOKEN_KEY = "hge_token";
export const USER_KEY = "hge_user";

export const saveAuth = (token: string, user: object) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const u = localStorage.getItem(USER_KEY);
  return u ? JSON.parse(u) : null;
};

// Fetch wrapper
interface ApiOptions extends RequestInit {
  auth?: boolean; // kept for backward compatibility — token is now always sent if available
}

export class HttpError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
  }
}

async function readJsonSafe(res: Response): Promise<unknown> {
  if (res.status === 204) return null;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function getMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  if (!("message" in data)) return null;
  const msg = (data as { message?: unknown }).message;
  if (typeof msg === "string") return msg;
  return msg != null ? String(msg) : null;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const { headers = {}, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // Always attach the JWT token if one is stored — backend will ignore it on public routes
  const token = getToken();
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: finalHeaders,
    ...rest,
  });

  const data = await readJsonSafe(res);

  // Token expired or invalid — clear local auth and redirect to login
  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login";
    const msg = getMessage(data) || "Session expired. Please log in again.";
    throw new HttpError(msg, res.status, data);
  }

  if (!res.ok) {
    const msg = getMessage(data) || `Request failed (${res.status})`;
    throw new HttpError(msg, res.status, data);
  }

  return (data as T) ?? (null as T);
}
