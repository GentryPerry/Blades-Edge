import { useState, useEffect, useCallback } from "react";
import { auth as authApi, isAuthenticated } from "../api/client.js";

const IS_DEV = typeof window !== "undefined" && (
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.includes("stackblitz") ||
  window.location.hostname.includes("webcontainer") ||
  window.location.hostname.includes("local-credentialless")
);

const DEV_USER = { id: "dev-user-001", email: "dev@bladesedge.local", name: "Dev Scoundrel" };

export function useAuth() {
  const [user, setUser] = useState(IS_DEV ? DEV_USER : null);
  const [loading, setLoading] = useState(!IS_DEV);

  useEffect(() => {
    if (IS_DEV) return;
    if (!isAuthenticated()) { setLoading(false); return; }
    authApi.me()
      .then(setUser)
      .catch(() => { authApi.logout(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    if (IS_DEV) { setUser(DEV_USER); return DEV_USER; }
    const u = await authApi.login(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (email, password, passwordConfirm) => {
    if (IS_DEV) { setUser(DEV_USER); return DEV_USER; }
    const u = await authApi.register(email, password, passwordConfirm);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    if (IS_DEV) return;
    authApi.logout();
    setUser(null);
  }, []);

  return { user, loading, login, register, logout, IS_DEV };
}
