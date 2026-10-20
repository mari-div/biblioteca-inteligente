package com.biblioteca.dto;

/** Libro sugerido por el motor de recomendaciones (no se guarda hasta que se pide). */
public record SugerenciaResponse(
        Long idLibro,
        String titulo,
        String motivo,
        double puntaje
) {
}
