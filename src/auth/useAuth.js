/**
 * auth/useAuth.js — Auth state and actions for Blades Edge.
 *
 * Owns: current user, loading state, login/register/logout.
 * All callers get a stable `user` object or null — they never
 * import the API client or touch tokens directly.
 */

import { useState, useEffect, useCallback } from 'react';
import { auth as authApi, isAuthenticated } from '../api/client.js';

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true while verifying token on mount

  // On mount: if a token exists, verify it by fetching /auth/me.
  // If it fails (expired/invalid), clear it and stay logged out.
  useEffect(() => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }
    authApi.me()
      .then(setUser)
      .catch(() => { authApi.logout(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await authApi.login(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (email, password, passwordConfirm) => {
    const u = await authApi.register(email, password, passwordConfirm);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  return { user, loading, login, register, logout };
}
