package com.biblioteca.service;

import com.biblioteca.dto.SugerenciaResponse;
import com.biblioteca.exception.RecursoNoEncontradoException;
import com.biblioteca.model.Calificacion;
import com.biblioteca.model.Genero;
import com.biblioteca.model.Libro;
import com.biblioteca.model.Recomendacion;
import com.biblioteca.repository.CalificacionRepository;
import com.biblioteca.repository.GeneroRepository;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.PrestamoRepository;
import com.biblioteca.repository.RecomendacionRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class RecomendacionService {

    private static final int MAX_SUGERENCIAS = 6;
    private static final int MIN_CANDIDATOS = 3;
    private static final double AFINIDAD_MINIMA = 4.0;

    private final RecomendacionRepository recomendacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final LibroRepository libroRepository;
    private final GeneroRepository generoRepository;
    private final CalificacionRepository calificacionRepository;
    private final PrestamoRepository prestamoRepository;

    public RecomendacionService(RecomendacionRepository recomendacionRepository,
                                UsuarioRepository usuarioRepository,
                                LibroRepository libroRepository,
                                GeneroRepository generoRepository,
                                CalificacionRepository calificacionRepository,
                                PrestamoRepository prestamoRepository) {
        this.recomendacionRepository = recomendacionRepository;
        this.usuarioRepository = usuarioRepository;
        this.libroRepository = libroRepository;
        this.generoRepository = generoRepository;
        this.calificacionRepository = calificacionRepository;
        this.prestamoRepository = prestamoRepository;
    }

    public List<Recomendacion> listar() {
        return recomendacionRepository.findAll();
    }

    public Optional<Recomendacion> buscarPorId(Long id) {
        return recomendacionRepository.findById(id);
    }

    public Recomendacion guardar(Recomendacion recomendacion) {
        return recomendacionRepository.save(recomendacion);
    }

    public Recomendacion actualizar(Long id, Recomendacion recomendacion) {
        recomendacion.setIdRecomendacion(id);
        return recomendacionRepository.save(recomendacion);
    }

    public void eliminar(Long id) {
        recomendacionRepository.deleteById(id);
    }

    /**
     * Mismo algoritmo que front-end/src/features/recomendaciones/engine.js:
     *  1. Géneros que el usuario calificó con media >= 4: otros libros de esos géneros que no ha leído.
     *  2. Si hay menos de 3 candidatos: los libros mejor calificados por el resto de lectores.
     *  3. Si siguen faltando: libros disponibles que aún no ha explorado.
     */
    public List<SugerenciaResponse> sugerir(Long idUsuario) {
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new RecursoNoEncontradoException("No existe el usuario con id " + idUsuario);
        }

        List<Libro> libros = libroRepository.findAll();
        Map<Long, Libro> librosPorId = libros.stream()
                .collect(Collectors.toMap(Libro::getIdLibro, Function.identity()));
        Map<Long, String> nombreGenero = generoRepository.findAll().stream()
                .collect(Collectors.toMap(Genero::getIdGenero, Genero::getNombre));

        List<Calificacion> calificaciones = calificacionRepository.findAll();
        List<Calificacion> mias = calificaciones.stream()
                .filter(c -> idUsuario.equals(c.getIdUsuario()))
                .toList();

        Set<Long> leidos = new HashSet<>();
        mias.forEach(c -> leidos.add(c.getIdLibro()));
        prestamoRepository.findAll().stream()
                .filter(p -> idUsuario.equals(p.getIdUsuario()))
                .forEach(p -> leidos.add(p.getIdLibro()));

        Map<Long, Double> promedioPorLibro = calificaciones.stream()
                .filter(c -> c.getIdLibro() != null && c.getPuntuacion() != null)
                .collect(Collectors.groupingBy(Calificacion::getIdLibro,
                        Collectors.averagingInt(Calificacion::getPuntuacion)));

        // Media de mis calificaciones por género
        Map<Long, Double> afinidadPorGenero = mias.stream()
                .filter(c -> c.getPuntuacion() != null)
                .filter(c -> librosPorId.containsKey(c.getIdLibro()))
                .filter(c -> librosPorId.get(c.getIdLibro()).getIdGenero() != null)
                .collect(Collectors.groupingBy(c -> librosPorId.get(c.getIdLibro()).getIdGenero(),
                        Collectors.averagingInt(Calificacion::getPuntuacion)));

        Map<Long, SugerenciaResponse> candidatos = new LinkedHashMap<>();

        afinidadPorGenero.entrySet().stream()
                .filter(e -> e.getValue() >= AFINIDAD_MINIMA)
                .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
                .forEach(e -> libros.stream()
                        .filter(l -> e.getKey().equals(l.getIdGenero()) && !leidos.contains(l.getIdLibro()))
                        .forEach(l -> candidatos.putIfAbsent(l.getIdLibro(), new SugerenciaResponse(
                                l.getIdLibro(),
                                l.getTitulo(),
                                String.format(Locale.ROOT, "Porque calificaste con %.1f★ libros de %s.",
                                        e.getValue(), nombreGenero.getOrDefault(e.getKey(), "este género")),
                                e.getValue() * 10 + promedioPorLibro.getOrDefault(l.getIdLibro(), 0.0)))));

        if (candidatos.size() < MIN_CANDIDATOS) {
            libros.stream()
                    .filter(l -> !leidos.contains(l.getIdLibro()) && !candidatos.containsKey(l.getIdLibro()))
                    .filter(l -> promedioPorLibro.getOrDefault(l.getIdLibro(), 0.0) > 0)
                    .forEach(l -> {
                        double promedio = promedioPorLibro.get(l.getIdLibro());
                        candidatos.put(l.getIdLibro(), new SugerenciaResponse(
                                l.getIdLibro(),
                                l.getTitulo(),
                                String.format(Locale.ROOT,
                                        "Es uno de los mejor calificados por otros lectores (%.1f★).", promedio),
                                promedio));
                    });
        }

        if (candidatos.size() < MIN_CANDIDATOS) {
            libros.stream()
                    .filter(l -> Boolean.TRUE.equals(l.getDisponible()))
                    .filter(l -> !leidos.contains(l.getIdLibro()) && !candidatos.containsKey(l.getIdLibro()))
                    .forEach(l -> candidatos.put(l.getIdLibro(), new SugerenciaResponse(
                            l.getIdLibro(),
                            l.getTitulo(),
                            "Disponible ahora mismo y aún no lo has explorado.",
                            1)));
        }

        return candidatos.values().stream()
                .sorted(Comparator.comparingDouble(SugerenciaResponse::puntaje).reversed())
                .limit(MAX_SUGERENCIAS)
                .toList();
    }

    /** Calcula las sugerencias y guarda las que el usuario aún no tenía como recomendación. */
    @Transactional
    public List<Recomendacion> generar(Long idUsuario) {
        return sugerir(idUsuario).stream()
                .filter(s -> !recomendacionRepository.existsByIdUsuarioAndIdLibro(idUsuario, s.idLibro()))
                .map(s -> {
                    Recomendacion recomendacion = new Recomendacion();
                    recomendacion.setIdUsuario(idUsuario);
                    recomendacion.setIdLibro(s.idLibro());
                    recomendacion.setMotivo(s.motivo());
                    return recomendacionRepository.save(recomendacion);
                })
                .toList();
    }
}
