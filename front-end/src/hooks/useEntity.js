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
 */
export function useEntity(name, idField, seed, mode, baseUrl, pushToast) {
  const storageKey = "bi_demo_" + name;
  const [items, setItems] = useState(() => readLocal(storageKey, seed));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "demo") writeLocal(storageKey, items);
  }, [items, mode, storageKey]);

  const refresh = useCallback(async () => {
    if (mode !== "live") return;
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/${name}`);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      pushToast("error", `No se pudo cargar ${name} desde el backend (${err.message}).`);
    } finally {
      setLoading(false);
    }
  }, [mode, baseUrl, name, pushToast]);

  useEffect(() => {
    if (mode === "live") refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, baseUrl]);

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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const record = await res.json();
        setItems((prev) => [...prev, record]);
        return record;
      } catch (err) {
        pushToast("error", `No se pudo crear el registro (${err.message}).`);
        throw err;
      }
    },
    [mode, baseUrl, name, idField, pushToast]
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const record = await res.json();
        setItems((prev) => prev.map((i) => (i[idField] === id ? record : i)));
      } catch (err) {
        pushToast("error", `No se pudo actualizar el registro (${err.message}).`);
        throw err;
      }
    },
    [mode, baseUrl, name, idField, pushToast]
  );

  const remove = useCallback(
    async (id) => {
      if (mode === "demo") {
        setItems((prev) => prev.filter((i) => i[idField] !== id));
        return;
      }
      try {
        const res = await fetch(`${baseUrl}/${name}/${id}`, { method: "DELETE" });
        if (!res.ok && res.status !== 204) throw new Error("HTTP " + res.status);
        setItems((prev) => prev.filter((i) => i[idField] !== id));
      } catch (err) {
        pushToast("error", `No se pudo eliminar el registro (${err.message}).`);
        throw err;
      }
    },
    [mode, baseUrl, name, idField, pushToast]
  );

  return { items, setItems, loading, create, update, remove, refresh };
}
