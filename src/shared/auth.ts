/**
 * auth.ts
 * -------
 * Centralized authentication utilities.
 * Single source of truth for all token storage/retrieval.
 *
 * Keys stored in localStorage:
 *   'accessToken'       – required by the API (Authorization: Bearer <token>)
 *   'refreshToken'      – stored for future refresh flows
 *   'gubera_admin_token'– canonical app key (aliases accessToken)
 *   'gubera_admin_user' – serialized UserProfile JSON
 */

export const TOKEN_KEY = 'gubera_admin_token';
export const ACCESS_TOKEN_KEY = 'accessToken';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const USER_KEY = 'gubera_admin_user';
export const TENANT_ID_KEY = 'gubera_tenant_id';

export interface StoredUser {
  id: string;
  name: string;
  mobilenumber: string;
  email?: string | null;
  role: string;
  status?: string;
}

/** Returns the access token if one is stored, else null. */
export function getStoredToken(): string | null {
  return (
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    null
  );
}

/** Saves the access/refresh tokens, user profile, and tenantId after a successful login. */
export function saveAuthData(
  accessToken: string,
  refreshToken: string,
  user: StoredUser,
  tenantId?: string
): void {
  // Store under both keys so client.ts and any future code all agree.
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Persist tenantId from env or passed value so it survives page refresh.
  const tid = tenantId || import.meta.env?.VITE_TENANT_ID || '';
  if (tid) localStorage.setItem(TENANT_ID_KEY, tid);
}

/** Removes all auth data from storage. Call on logout. */
export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TENANT_ID_KEY);
}

export function getStoredTenantId(): string {
  const envTenantId = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_TENANT_ID) || '';
  const cachedTenantId = localStorage.getItem(TENANT_ID_KEY);
  
  if (envTenantId) {
    if (cachedTenantId !== envTenantId) {
      localStorage.setItem(TENANT_ID_KEY, envTenantId);
    }
    return envTenantId;
  } else {
    // If env is empty but cache exists, clear the cache to reflect the removal
    if (cachedTenantId) {
      localStorage.removeItem(TENANT_ID_KEY);
    }
    return '';
  }
}

/** Returns the stored user profile or null. */
export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

/** Returns true if the user appears to be authenticated. */
export function isAuthenticated(): boolean {
  return Boolean(getStoredToken());
}

// Module-level cleanup of outdated localStorage tenant ID cache
(function syncTenantId() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const envId = import.meta.env?.VITE_TENANT_ID;
    const cachedId = localStorage.getItem(TENANT_ID_KEY);
    if (envId) {
      if (cachedId !== envId) {
        localStorage.setItem(TENANT_ID_KEY, envId);
      }
    } else if (cachedId) {
      localStorage.removeItem(TENANT_ID_KEY);
    }
  }
})();
