const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

// Student and admin sessions are kept independent so a browser can (in principle)
// hold both without one login clobbering the other.
function getToken(scope: 'token' | 'adminToken' = 'token'): string | null {
  return localStorage.getItem(scope);
}

export function setToken(token: string | null, scope: 'token' | 'adminToken' = 'token') {
  if (token) localStorage.setItem(scope, token);
  else localStorage.removeItem(scope);
}

async function request<T>(path: string, options: RequestInit = {}, scope: 'token' | 'adminToken' = 'token'): Promise<T> {
  const token = getToken(scope);
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
};

export const adminApi = {
  get: <T>(path: string) => request<T>(path, {}, 'adminToken'),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }, 'adminToken'),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }, 'adminToken'),
};
