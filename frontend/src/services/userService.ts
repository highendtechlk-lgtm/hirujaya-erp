/**
 * userService.ts
 * Admin-only user management — POST /api/users, GET /api/users, etc.
 */
import { apiFetch } from '../api/api';

export interface UserRecord {
  _id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'agm' | 'rm' | 'bdm';
  phone?: string;
  is_active: boolean;
  salary_status: string;
  createdAt: string;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role: 'admin' | 'agm' | 'rm' | 'bdm';
  phone?: string;
}

export interface UpdateUserPayload {
  full_name?: string;
  phone?: string;
  is_active?: boolean;
}

// List all users (admin)
export async function listUsers(params?: { role?: string; is_active?: boolean }): Promise<UserRecord[]> {
  const query = new URLSearchParams();
  if (params?.role)      query.append('role',      params.role);
  if (params?.is_active !== undefined) query.append('is_active', String(params.is_active));
  const res = await apiFetch<{ data: UserRecord[] }>(`/api/users?${query}`, { auth: true });
  return res.data;
}

// Get single user by ID
export async function getUserById(id: string): Promise<UserRecord> {
  const res = await apiFetch<{ data: UserRecord }>(`/api/users/${id}`, { auth: true });
  return res.data;
}

// Create new user (admin)
export async function createUser(payload: CreateUserPayload): Promise<UserRecord> {
  const res = await apiFetch<{ data: UserRecord }>('/api/users', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(payload),
  });
  return res.data;
}

// Update user profile (admin)
export async function updateUser(id: string, payload: UpdateUserPayload): Promise<UserRecord> {
  const res = await apiFetch<{ data: UserRecord }>(`/api/users/${id}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(payload),
  });
  return res.data;
}

// Change user password (admin)
export async function changeUserPassword(id: string, new_password: string, confirm_password: string): Promise<void> {
  await apiFetch(`/api/users/${id}/password`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify({ new_password, confirm_password }),
  });
}

// Assign AGM + RM to BDM (admin)
export async function assignTeamToBdm(bdmId: string, agm_id?: string, rm_id?: string): Promise<void> {
  await apiFetch(`/api/users/${bdmId}/assign-team`, {
    method: 'PUT',
    auth: true,
    body: JSON.stringify({ agm_id, rm_id }),
  });
}
