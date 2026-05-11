/**
 * api/client.js — The single data-layer seam for Blades Edge.
 *
 * All network calls in the app go through these functions.
 * Today they call Cloudflare Workers endpoints (JWT auth, D1 backend).
 * The rest of the app never imports PocketBase or fetch directly.
 *
 * Auth token is stored in localStorage under 'be_token'.
 * Every authenticated request sends it as Authorization: Bearer <token>.
 */

const BASE = import.meta.env.VITE_API_BASE ?? '';

// ─── Token helpers ────────────────────────────────────────────────────────────

export function getToken() {
  try { return localStorage.getItem('be_token'); } catch { return null; }
}

function setToken(token) {
  try { localStorage.setItem('be_token', token ?? ''); } catch {}
}

export function clearToken() {
  try { localStorage.removeItem('be_token'); } catch {}
}

export function isAuthenticated() {
  return !!getToken();
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {}
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const auth = {
  async login(email, password) {
    const data = await request('/auth/login', { method: 'POST', body: { email, password }, auth: false });
    setToken(data.token);
    return data.user;
  },

  async register(email, password, passwordConfirm) {
    const data = await request('/auth/register', { method: 'POST', body: { email, password, passwordConfirm }, auth: false });
    setToken(data.token);
    return data.user;
  },

  async me() {
    return request('/auth/me');
  },

  logout() {
    clearToken();
  },
};

// ─── Characters ───────────────────────────────────────────────────────────────

export const characters = {
  list() {
    return request('/characters');
  },

  get(id) {
    return request(`/characters/${id}`);
  },

  create(payload) {
    return request('/characters', { method: 'POST', body: payload });
  },

  update(id, payload) {
    return request(`/characters/${id}`, { method: 'PATCH', body: payload });
  },

  remove(id) {
    return request(`/characters/${id}`, { method: 'DELETE' });
  },
};

// ─── Crews ────────────────────────────────────────────────────────────────────

export const crews = {
  list() {
    return request('/crews');
  },

  get(id) {
    return request(`/crews/${id}`);
  },

  create(payload) {
    return request('/crews', { method: 'POST', body: payload });
  },

  update(id, payload) {
    return request(`/crews/${id}`, { method: 'PATCH', body: payload });
  },

  join(inviteCode) {
    return request('/crews/join', { method: 'POST', body: { inviteCode } });
  },

  leave(id) {
    return request(`/crews/${id}/leave`, { method: 'POST' });
  },

  members(id) {
    return request(`/crews/${id}/members`);
  },
};

// ─── GM Flow ──────────────────────────────────────────────────────────────────

export const gmFlow = {
  get(crewId) {
    const path = crewId ? `/gm-flow/${crewId}` : '/gm-flow/personal';
    return request(path);
  },

  save(crewId, payload) {
    const path = crewId ? `/gm-flow/${crewId}` : '/gm-flow/personal';
    return request(path, { method: 'PATCH', body: payload });
  },
};
