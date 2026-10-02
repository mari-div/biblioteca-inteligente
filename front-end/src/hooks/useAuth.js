import { useState, useCallback, useEffect } from "react";
import { readLocal, writeLocal } from "../utils/storage.js";

/**
 * Maneja la sesión real contra el backend (POST /api/auth/login,
 * /register, GET /api/auth/me). El token se guarda en localStorage
 * para que la sesión sobreviva a un refresh de la página.
 */
export function useAuth(baseUrl, mode) {
  const [token, setToken] = useState(() => readLocal("bi_token", null));
  const [user, setUser] = useState(() => readLocal("bi_auth_user", null));
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (token) writeLocal("bi_token", token);
    else localStorage.removeItem("bi_token");
  }, [token]);
  useEffect(() => {
    if (user) writeLocal("bi_auth_user", user);
    else localStorage.removeItem("bi_auth_user");
  }, [user]);

  // Si cambiamos a modo real y ya había un token guardado, confirmamos
  // que siga siendo válido contra el backend.
  useEffect(() => {
    if (mode !== "live" || !token) return;
    setChecking(true);
    fetch(`${baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => { if (!res.ok) throw new Error("sesión inválida"); return res.json(); })
      .then((data) => setUser(data))
      .catch(() => { setToken(null); setUser(null); })
      .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const login = useCallback(async (email, password) => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || "No se pudo iniciar sesión.");
    setToken(data.token);
    setUser({ idUsuario: data.idUsuario, nombre: data.nombre, email: data.email, rol: data.rol });
    return data;
  }, [baseUrl]);

  const register = useCallback(async (nombre, email, password) => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || "No se pudo crear la cuenta.");
    setToken(data.token);
    setUser({ idUsuario: data.idUsuario, nombre: data.nombre, email: data.email, rol: data.rol });
    return data;
  }, [baseUrl]);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);

  return { token, user, checking, login, register, logout };
}
