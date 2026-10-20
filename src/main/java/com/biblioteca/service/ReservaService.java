package com.biblioteca.service;

import com.biblioteca.dto.ReservaRequest;
import com.biblioteca.exception.RecursoNoEncontradoException;
import com.biblioteca.exception.ReglaNegocioException;
import com.biblioteca.model.Libro;
import com.biblioteca.model.Notificacion;
import com.biblioteca.model.Reserva;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.NotificacionRepository;
import com.biblioteca.repository.PrestamoRepository;
import com.biblioteca.repository.ReservaRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class ReservaService {

    public static final String PENDIENTE = "pendiente";
    public static final String LISTA = "lista";
    public static final String CANCELADA = "cancelada";

    private static final List<String> ACTIVAS = List.of(PENDIENTE, LISTA);

    private final ReservaRepository reservaRepository;
    private final LibroRepository libroRepository;
    private final UsuarioRepository usuarioRepository;
    private final PrestamoRepository prestamoRepository;
    private final NotificacionRepository notificacionRepository;

    public ReservaService(ReservaRepository reservaRepository,
                          LibroRepository libroRepository,
                          UsuarioRepository usuarioRepository,
                          PrestamoRepository prestamoRepository,
                          NotificacionRepository notificacionRepository) {
        this.reservaRepository = reservaRepository;
        this.libroRepository = libroRepository;
        this.usuarioRepository = usuarioRepository;
        this.prestamoRepository = prestamoRepository;
        this.notificacionRepository = notificacionRepository;
    }

    public List<Reserva> listar() {
        return reservaRepository.findAll();
    }

    public Reserva buscarPorId(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe la reserva con id " + id));
    }

    @Transactional
    public Reserva registrar(ReservaRequest request) {
        validarUsuario(request.getIdUsuario());
        Libro libro = obtenerLibro(request.getIdLibro());
        validarSinDuplicados(request.getIdUsuario(), libro.getIdLibro());

        if (Boolean.TRUE.equals(libro.getDisponible())) {
            throw new ReglaNegocioException(
                    "'" + libro.getTitulo() + "' está disponible: puedes pedirlo prestado directamente");
        }

        Reserva reserva = new Reserva();
        reserva.setIdUsuario(request.getIdUsuario());
        reserva.setIdLibro(libro.getIdLibro());
        reserva.setEstado(PENDIENTE); // toda reserva nueva entra a la cola
        Reserva guardada = reservaRepository.save(reserva);

        long posicion = reservaRepository.countByIdLibroAndEstado(libro.getIdLibro(), PENDIENTE);
        notificar(request.getIdUsuario(),
                "Tu reserva de '" + libro.getTitulo() + "' está en cola (posición " + posicion + ").");

        return guardada;
    }

    @Transactional
    public Reserva actualizar(Long id, ReservaRequest request) {
        Reserva reserva = buscarPorId(id);

        if (!Objects.equals(reserva.getIdUsuario(), request.getIdUsuario())
                || !Objects.equals(reserva.getIdLibro(), request.getIdLibro())) {
            throw new ReglaNegocioException(
                    "No se puede cambiar el usuario ni el libro de una reserva; cancélala y crea otra");
        }

        String actual = reserva.getEstado();
        String nuevo = request.getEstado();
        if (Objects.equals(actual, nuevo)) {
            return reserva;
        }

        Libro libro = obtenerLibro(reserva.getIdLibro());

        switch (actual + "->" + nuevo) {
            case PENDIENTE + "->" + LISTA -> {
                if (!Boolean.TRUE.equals(libro.getDisponible())) {
                    throw new ReglaNegocioException(
                            "'" + libro.getTitulo() + "' todavía no ha sido devuelto; la reserva no puede estar lista");
                }
                libro.setDisponible(false); // queda apartado para este usuario
                libroRepository.save(libro);
                notificar(reserva.getIdUsuario(),
                        "'" + libro.getTitulo() + "' ya está disponible para que lo recojas.");
            }
            case PENDIENTE + "->" + CANCELADA -> {
                // sin efectos sobre el libro
            }
            case LISTA + "->" + CANCELADA -> liberarLibro(libro);
            case CANCELADA + "->" + PENDIENTE -> validarSinDuplicados(reserva.getIdUsuario(), reserva.getIdLibro());
            default -> throw new ReglaNegocioException(
                    "No se puede pasar una reserva de '" + actual + "' a '" + nuevo + "'");
        }

        reserva.setEstado(nuevo);
        return reservaRepository.save(reserva);
    }

    @Transactional
    public void eliminar(Long id) {
        Reserva reserva = buscarPorId(id);
        reservaRepository.delete(reserva);

        // Si el libro estaba apartado para esta reserva, pasa al siguiente de la cola
        if (LISTA.equals(reserva.getEstado())) {
            libroRepository.findById(reserva.getIdLibro()).ifPresent(this::liberarLibro);
        }
    }

    /**
     * Se llama cuando un libro deja de estar ocupado (devolución o cancelación).
     * Si hay alguien en la cola, el libro queda apartado para él y se le notifica;
     * si no, vuelve a estar disponible.
     */
    @Transactional
    public void liberarLibro(Libro libro) {
        Optional<Reserva> siguiente = reservaRepository
                .findFirstByIdLibroAndEstadoOrderByFechaReservaAsc(libro.getIdLibro(), PENDIENTE);

        if (siguiente.isPresent()) {
            Reserva reserva = siguiente.get();
            reserva.setEstado(LISTA);
            reservaRepository.save(reserva);
            libro.setDisponible(false);
            notificar(reserva.getIdUsuario(),
                    "'" + libro.getTitulo() + "' ya está disponible para que lo recojas.");
        } else {
            libro.setDisponible(true);
        }

        libroRepository.save(libro);
    }

    /** Reserva "lista" (libro apartado) que tenga este libro, si existe. */
    public Optional<Reserva> buscarReservaLista(Long idLibro) {
        return reservaRepository.findFirstByIdLibroAndEstadoOrderByFechaReservaAsc(idLibro, LISTA);
    }

    /** Cierra una reserva cuando el usuario se lleva el libro en préstamo. */
    @Transactional
    public void cerrarPorEntrega(Reserva reserva) {
        reservaRepository.delete(reserva);
    }

    private void validarSinDuplicados(Long idUsuario, Long idLibro) {
        if (reservaRepository.existsByIdUsuarioAndIdLibroAndEstadoIn(idUsuario, idLibro, ACTIVAS)) {
            throw new ReglaNegocioException("El usuario ya tiene una reserva activa de este libro");
        }
        if (prestamoRepository.existsByIdUsuarioAndIdLibroAndEstado(idUsuario, idLibro, PrestamoService.ACTIVO)) {
            throw new ReglaNegocioException("El usuario ya tiene este libro en préstamo");
        }
    }

    private void validarUsuario(Long idUsuario) {
        if (!usuarioRepository.existsById(idUsuario)) {
            throw new RecursoNoEncontradoException("No existe el usuario con id " + idUsuario);
        }
    }

    private Libro obtenerLibro(Long idLibro) {
        return libroRepository.findById(idLibro)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el libro con id " + idLibro));
    }

    private void notificar(Long idUsuario, String mensaje) {
        Notificacion notificacion = new Notificacion();
        notificacion.setIdUsuario(idUsuario);
        notificacion.setMensaje(mensaje);
        notificacion.setTipo("reserva");
        notificacionRepository.save(notificacion);
    }
}
