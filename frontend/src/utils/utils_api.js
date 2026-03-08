/**
 * utils/api.js
 * 
 * Drop this file at:  src/utils/api.js  (or wherever your screens import from)
 * 
 * Usage in any screen:
 *   import { apiFetch } from '../utils/api';
 *   const data = await apiFetch('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({...}) });
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️  Change this to your machine's LAN IP when testing on a physical device.
//     e.g.  'http://192.168.1.10:8000'
export const BASE_URL = 'http://localhost:8000';

/**
 * Authenticated fetch wrapper.
 * - Automatically attaches the Bearer token from AsyncStorage.
 * - On 401 it attempts a single token refresh, then retries.
 * - Throws an object with a `detail` field on API errors so callers can do:
 *     alert(err.detail || 'Something went wrong')
 */
export async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('access_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401) {
    const refreshed = await _tryRefresh();
    if (refreshed) {
      const newToken = await AsyncStorage.getItem('access_token');
      headers.Authorization = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    let errBody = {};
    try { errBody = await res.json(); } catch (_) {}
    throw errBody;
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

async function _tryRefresh() {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    await AsyncStorage.setItem('access_token', data.access_token);
    await AsyncStorage.setItem('refresh_token', data.refresh_token);
    return true;
  } catch {
    return false;
  }
}
