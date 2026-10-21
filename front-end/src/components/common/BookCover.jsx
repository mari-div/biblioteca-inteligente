import { useState } from "react";
import { genreColor } from "../../utils/format.js";

// Open Library sirve la portada por ISBN; con ?default=false responde 404 si no existe
// (en lugar de una imagen en blanco), así que onError nos deja mostrar el respaldo.
const coverUrl = (isbn, size) => `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg?default=false`;

const cleanIsbn = (isbn) => (isbn || "").replace(/[^0-9Xx]/g, "");

/**
 * Portada del libro. Si el libro no tiene ISBN o no hay portada disponible,
 * muestra una tapa con el color de su género y el título.
 *
 * @param {{titulo:string, isbn?:string, idGenero?:number}} libro
 * @param {"M"|"L"} size  tamaño que se pide a Open Library
 */
export default function BookCover({ libro, size = "M", className = "" }) {
  const isbn = cleanIsbn(libro.isbn);
  const [failedIsbn, setFailedIsbn] = useState(null);
  const color = genreColor(libro.idGenero || 1);

  if (!isbn || failedIsbn === isbn) {
    return (
      <div className={"book-cover book-cover-fallback " + className} style={{ background: `linear-gradient(160deg, ${color}, ${color}99)` }} aria-label={`Portada de ${libro.titulo}`}>
        <span>{libro.titulo}</span>
      </div>
    );
  }

  return (
    <div className={"book-cover " + className}>
      <img
        src={coverUrl(isbn, size)}
        alt={`Portada de ${libro.titulo}`}
        loading="lazy"
        onError={() => setFailedIsbn(isbn)}
      />
    </div>
  );
}
