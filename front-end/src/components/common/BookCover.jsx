import { useEffect, useState } from "react";
import { genreColor } from "../../utils/format.js";
import { buscarPortadaPorTitulo } from "../../utils/covers.js";

// Open Library sirve la portada por ISBN; con ?default=false responde 404 si no existe
// (en lugar de una imagen en blanco), así que onError nos deja pasar a la siguiente opción.
const openLibraryUrl = (isbn, size) => `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`;

const cleanIsbn = (isbn) => (isbn || "").replace(/[^0-9Xx]/g, "");

/** URLs candidatas para la portada, por orden de prioridad: la que puso el administrador y luego Open Library por ISBN. */
export const coverSources = (libro, size = "M") => {
  const isbn = cleanIsbn(libro.isbn);
  return [libro.portadaUrl?.trim(), isbn && openLibraryUrl(isbn, size)].filter(Boolean);
};

/**
 * Portada del libro. Orden de búsqueda:
 *  1. la URL que el administrador guardó (portadaUrl),
 *  2. Open Library por ISBN,
 *  3. Open Library por título y autor,
 *  4. una tapa con el color de su género y el título.
 *
 * @param {{titulo:string, isbn?:string, portadaUrl?:string, idGenero?:number}} libro
 * @param {string} autor  nombre del autor, mejora la búsqueda por título
 * @param {"M"|"L"} size  tamaño que se pide a Open Library
 */
export default function BookCover({ libro, autor, size = "M", className = "" }) {
  const [failed, setFailed] = useState([]);
  const [porTitulo, setPorTitulo] = useState(null);

  const base = coverSources(libro, size);
  const agotadas = base.every((url) => failed.includes(url));

  useEffect(() => {
    if (!agotadas) return;
    let vigente = true;
    buscarPortadaPorTitulo(libro.titulo, autor).then((url) => vigente && setPorTitulo(url));
    return () => { vigente = false; };
  }, [agotadas, libro.titulo, autor]);

  const src = [...base, porTitulo].filter(Boolean).find((url) => !failed.includes(url));
  const color = genreColor(libro.idGenero || 1);

  if (!src) {
    return (
      <div className={"book-cover book-cover-fallback " + className} style={{ background: `linear-gradient(160deg, ${color}, ${color}99)` }} aria-label={`Portada de ${libro.titulo}`}>
        <span>{libro.titulo}</span>
      </div>
    );
  }

  return (
    <div className={"book-cover " + className}>
      <img
        src={src}
        alt={`Portada de ${libro.titulo}`}
        loading="lazy"
        onError={() => setFailed((f) => [...f, src])}
      />
    </div>
  );
}
