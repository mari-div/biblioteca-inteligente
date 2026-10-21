import { useState } from "react";
import { genreColor } from "../../utils/format.js";

// Open Library sirve la portada por ISBN; con ?default=false responde 404 si no existe
// (en lugar de una imagen en blanco), así que onError nos deja pasar a la siguiente opción.
const openLibraryUrl = (isbn, size) => `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`;

const cleanIsbn = (isbn) => (isbn || "").replace(/[^0-9Xx]/g, "");

/** URLs candidatas para la portada, por orden de prioridad: la que puso el administrador y luego Open Library. */
export const coverSources = (libro, size = "M") => {
  const isbn = cleanIsbn(libro.isbn);
  return [libro.portadaUrl?.trim(), isbn && openLibraryUrl(isbn, size)].filter(Boolean);
};

/**
 * Portada del libro. Usa la URL que el administrador guardó (portadaUrl) y, si no hay o
 * no carga, la de Open Library por ISBN. Si ninguna funciona, muestra una tapa con el
 * color de su género y el título.
 *
 * @param {{titulo:string, isbn?:string, portadaUrl?:string, idGenero?:number}} libro
 * @param {"M"|"L"} size  tamaño que se pide a Open Library
 */
export default function BookCover({ libro, size = "M", className = "" }) {
  const [failed, setFailed] = useState([]);
  const src = coverSources(libro, size).find((url) => !failed.includes(url));
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
