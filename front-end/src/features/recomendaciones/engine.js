/**
 * Calcula recomendaciones para un usuario a partir de sus calificaciones.
 * Estrategia:
 *  1. Si el usuario ya calificó libros con 4 o más estrellas, prioriza otros
 *     libros de esos mismos géneros que aún no ha leído.
 *  2. Si no hay suficientes candidatos, completa con los libros mejor
 *     calificados por el resto de la comunidad.
 *  3. Si todavía faltan, completa con libros disponibles que el usuario
 *     no ha explorado.
 */
export function computeRecommendations(viewer, store) {
  if (!viewer) return [];
  const { libros, calificaciones, prestamos, generos } = store;

  const misCalif = calificaciones.items.filter((c) => c.idUsuario === viewer.idUsuario);
  const leidos = new Set([
    ...misCalif.map((c) => c.idLibro),
    ...prestamos.items.filter((p) => p.idUsuario === viewer.idUsuario).map((p) => p.idLibro),
  ]);

  const afinidad = {};
  misCalif.forEach((c) => {
    const libro = libros.items.find((l) => l.idLibro === c.idLibro);
    if (!libro) return;
    afinidad[libro.idGenero] = afinidad[libro.idGenero] || { sum: 0, n: 0 };
    afinidad[libro.idGenero].sum += c.puntuacion;
    afinidad[libro.idGenero].n += 1;
  });

  const generosFavoritos = Object.entries(afinidad)
    .map(([idGenero, v]) => ({ idGenero: Number(idGenero), avg: v.sum / v.n }))
    .filter((g) => g.avg >= 4)
    .sort((a, b) => b.avg - a.avg);

  const ratingPromedio = (idLibro) => {
    const rel = calificaciones.items.filter((c) => c.idLibro === idLibro);
    return rel.length ? rel.reduce((s, c) => s + c.puntuacion, 0) / rel.length : 0;
  };

  let candidatos = [];

  if (generosFavoritos.length) {
    generosFavoritos.forEach((gf) => {
      const genero = generos.items.find((g) => g.idGenero === gf.idGenero);
      libros.items
        .filter((l) => l.idGenero === gf.idGenero && !leidos.has(l.idLibro))
        .forEach((l) => {
          candidatos.push({
            libro: l,
            motivo: `Porque calificaste con ${gf.avg.toFixed(1)}★ libros de ${genero?.nombre || "este género"}.`,
            score: gf.avg * 10 + ratingPromedio(l.idLibro),
          });
        });
    });
  }

  if (candidatos.length < 3) {
    libros.items
      .filter((l) => !leidos.has(l.idLibro) && !candidatos.find((c) => c.libro.idLibro === l.idLibro))
      .forEach((l) => {
        const r = ratingPromedio(l.idLibro);
        if (r > 0) candidatos.push({ libro: l, motivo: `Es uno de los mejor calificados por otros lectores (${r.toFixed(1)}★).`, score: r });
      });
  }

  if (candidatos.length < 3) {
    libros.items
      .filter((l) => l.disponible && !leidos.has(l.idLibro) && !candidatos.find((c) => c.libro.idLibro === l.idLibro))
      .forEach((l) => {
        candidatos.push({ libro: l, motivo: "Disponible ahora mismo y aún no lo has explorado.", score: 1 });
      });
  }

  candidatos.sort((a, b) => b.score - a.score);
  const vistos = new Set();
  return candidatos.filter((c) => (vistos.has(c.libro.idLibro) ? false : (vistos.add(c.libro.idLibro), true))).slice(0, 6);
}
