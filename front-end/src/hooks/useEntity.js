import { useState, useEffect, useCallback } from "react";
import { readLocal, writeLocal } from "../utils/storage.js";

/**
 * Hook genérico de CRUD para una entidad de la API.
 * En modo "demo" guarda todo en localStorage (mismo esquema que el backend).
 * En modo "live" llama a los endpoints REST reales: GET/POST/PUT/DELETE en `${baseUrl}/${name}`.
 *
 * @param {string} name       nombre del recurso, igual al path del controller (ej. "libros")
 * @param {string} idField    nombre del campo id (ej. "idLibro")
 * @param {Array}  seed       datos de ejemplo para modo demo
 * @param {"demo"|"live"} mode
 * @param {string} baseUrl    ej. "/api"
 * @param {(type:string, msg:string)=>void} pushToast
 * @param {string|null} token  token JWT de la sesión actual (solo aplica en modo "live")
 * @param {()=>void} onUnauthorized  se llama si el backend responde 401 (sesión vencida/ inválida)
 */
export function useEntity(name, idField, seed, mode, baseUrl, pushToast, token, onUnauthorized) {
  const storageKey = "bi_demo_" + name;
  const [items, setItems] = useState(() => readLocal(storageKey, seed));
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(
    (extra) => ({ ...(extra || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) }),
    [token]
  );

  const handleHttpError = useCallback(
    (res) => {
      if (res.status === 401 && onUnauthorized) onUnauthorized();
      if (res.status === 403) throw new Error("no tienes permiso para hacer esto con tu rol actual");
      throw new Error("HTTP " + res.status);
    },
    [onUnauthorized]
  );

  useEffect(() => {
    if (mode === "demo") writeLocal(storageKey, items);
  }, [items, mode, storageKey]);

  const refresh = useCallback(async () => {
    if (mode !== "live") return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/${name}`, { headers: authHeaders() });
      if (!res.ok) return handleHttpError(res);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      pushToast("error", `No se pudo cargar ${name} desde el backend (${err.message}).`);
    } finally {
      setLoading(false);
    }
  }, [mode, baseUrl, name, pushToast, authHeaders, handleHttpError]);

  useEffect(() => {
    if (mode === "live" && token) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, baseUrl, token]);

  const create = useCallback(
    async (payload) => {
      if (mode === "demo") {
        let record;
        setItems((prev) => {
          const nextId = prev.length ? Math.max(...prev.map((i) => i[idField] || 0)) + 1 : 1;
          record = { ...payload, [idField]: nextId };
          return [...prev, record];
        });
        return record;
      }
      try {
        const res = await fetch(`${baseUrl}/${name}`, {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload),
        });
        if (!res.ok) return handleHttpError(res);
        const record = await res.json();
        setItems((prev) => [...prev, record]);
        return record;
      } catch (err) {
        pushToast("error", `No se pudo crear el registro (${err.message}).`);
        throw err;
      }
    },
    [mode, baseUrl, name, idField, pushToast, authHeaders, handleHttpError]
  );

  const update = useCallback(
    async (id, payload) => {
      if (mode === "demo") {
        setItems((prev) => prev.map((i) => (i[idField] === id ? { ...i, ...payload, [idField]: id } : i)));
        return;
      }
      try {
        const res = await fetch(`${baseUrl}/${name}/${id}`, {
          method: "PUT",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify(payload),
        });
        if (!res.ok) return handleHttpError(res);
        const record = await res.json();
        setItems((prev) => prev.map((i) => (i[idField] === id ? record : i)));
      } catch (err) {
        pushToast("error", `No se pudo actualizar el registro (${err.message}).`);
        throw err;
      }
    },
    [mode, baseUrl, name, idField, pushToast, authHeaders, handleHttpError]
  );

  const remove = useCallback(
    async (id) => {
      if (mode === "demo") {
        setItems((prev) => prev.filter((i) => i[idField] !== id));
        return;
      }
      try {
        const res = await fetch(`${baseUrl}/${name}/${id}`, { method: "DELETE", headers: authHeaders() });
        if (!res.ok && res.status !== 204) return handleHttpError(res);
        setItems((prev) => prev.filter((i) => i[idField] !== id));
      } catch (err) {
        pushToast("error", `No se pudo eliminar el registro (${err.message}).`);
        throw err;
      }
    },
    [mode, baseUrl, name, idField, pushToast, authHeaders, handleHttpError]
  );

  return { items, setItems, loading, create, update, remove, refresh };
}
