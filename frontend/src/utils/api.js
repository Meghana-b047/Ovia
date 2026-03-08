// src/utils/api.js
// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  IMPORTANT: Change BASE_URL to your laptop's local IP address.
//    - Find it by running: ipconfig getifaddr en0  (Mac) or ipconfig (Windows)
//    - 'localhost' does NOT work on a physical phone — you need the actual IP
//    - Example: 'http://192.168.1.5:8000'
// ─────────────────────────────────────────────────────────────────────────────
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://192.168.1.5:8000'; // 🔁 REPLACE WITH YOUR IP

export async function apiFetch(path, options = {}) {
  const token = await AsyncStorage.getItem('access_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}
