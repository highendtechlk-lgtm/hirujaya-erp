/**
 * authService.ts
 * Handles login and current-user fetch.
 */
import { apiFetch, saveAuth, clearAuth } from '../api/api';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'agm' | 'rm' | 'bdm';
  salary_status: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<{ token: string; user: User }> {
  const res = await apiFetch<{ data: { token: string; user: User } }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const { token, user } = res.data;
  saveAuth(token, user);
  return { token, user };
}

export async function getMe(): Promise<User> {
  const res = await apiFetch<{ data: User }>('/api/auth/me', { auth: true });
  return res.data;
}

export function logout() {
  clearAuth();
}
