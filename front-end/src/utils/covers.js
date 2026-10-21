import { readLocal, writeLocal } from "./storage.js";

// Resultados de la búsqueda por título (url, o null si Open Library no encontró portada).
// Se guardan para no repetir la consulta en cada render ni en cada visita.
const memoria = new Map();
const STORAGE_KEY = "bi_cover_cache";

const clave = (titulo, autor) => `${titulo || ""}|${autor || ""}`.trim().toLowerCase();

/**
 * Busca la portada de un libro por título (y autor) en Open Library.
 * Se usa cuando el ISBN no tiene portada. Devuelve la URL de la imagen o null.
 */
export async function buscarPortadaPorTitulo(titulo, autor) {
  if (!titulo) return null;
  const k = clave(titulo, autor);

  if (memoria.has(k)) return memoria.get(k);
  const guardadas = readLocal(STORAGE_KEY, {});
  if (guardadas[k]) {
    memoria.set(k, guardadas[k]);
    return guardadas[k];
  }

  const promesa = (async () => {
    try {
      const params = new URLSearchParams({ title: titulo, limit: "5", fields: "cover_i,title" });
      if (autor) params.set("author", autor);
      const res = await fetch(`https://openlibrary.org/search.json?${params}`);
      if (!res.ok) return null;
      const data = await res.json();
      const hit = (data.docs || []).find((d) => d.cover_i);
      return hit ? `https://covers.openlibrary.org/b/id/${hit.cover_i}-L.jpg` : null;
    } catch {
      return null;
    }
  })();

  // Guardamos la promesa para que varias tarjetas iguales compartan una sola consulta.
  memoria.set(k, promesa);
  const url = await promesa;
  memoria.set(k, url);
  if (url) writeLocal(STORAGE_KEY, { ...readLocal(STORAGE_KEY, {}), [k]: url });
  return url;
}
