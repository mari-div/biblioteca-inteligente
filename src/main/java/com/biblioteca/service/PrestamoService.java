package com.biblioteca.service;

import com.biblioteca.dto.PrestamoRequest;
import com.biblioteca.exception.RecursoNoEncontradoException;
import com.biblioteca.exception.ReglaNegocioException;
import com.biblioteca.model.Libro;
import com.biblioteca.model.Notificacion;
import com.biblioteca.model.Prestamo;
import com.biblioteca.model.Reserva;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.NotificacionRepository;
import com.biblioteca.repository.PrestamoRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class PrestamoService {

    public static final String SOLICITADO = "solicitado";
    public static final String ACTIVO = "activo";
    public static final String DEVUELTO = "devuelto";
    public static final String RECHAZADO = "rechazado";

    private static final int MAX_PRESTAMOS_ACTIVOS = 3;
    private static final int DIAS_PRESTAMO = 14;

    private final PrestamoRepository prestamoRepository;
    private final LibroRepository libroRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionRepository notificacionRepository;
    private final ReservaService reservaService;

    public PrestamoService(PrestamoRepository prestamoRepository,
                           LibroRepository libroRepository,
                           UsuarioRepository usuarioRepository,
                           NotificacionRepository notificacionRepository,
                           ReservaService reservaService) {
        this.prestamoRepository = prestamoRepository;
        this.libroRepository = libroRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacionRepository = notificacionRepository;
        this.reservaService = reservaService;
    }

    public List<Prestamo> listar() {
        return prestamoRepository.findAll();
    }

    public Prestamo buscarPorId(Long id) {
        return prestamoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el préstamo con id " + id));
    }

    @Transactional
    public Prestamo registrar(PrestamoRequest request) {
        if (!usuarioRepository.existsById(request.getIdUsuario())) {
            throw new RecursoNoEncontradoException("No existe el usuario con id " + request.getIdUsuario());
        }
        Libro libro = libroRepository.findById(request.getIdLibro())
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el libro con id " + request.getIdLibro()));

        LocalDate fechaDevolucion = request.getFechaDevolucion() != null
                ? request.getFechaDevolucion()
                : request.getFechaPrestamo().plusDays(DIAS_PRESTAMO);
        validarFechas(request.getFechaPrestamo(), fechaDevolucion);

        Prestamo prestamo = new Prestamo();
        prestamo.setIdUsuario(request.getIdUsuario());
        prestamo.setIdLibro(libro.getIdLibro());
        prestamo.setFechaPrestamo(request.getFechaPrestamo());
        prestamo.setFechaDevolucion(fechaDevolucion);
        prestamo.setEstado(request.getEstado());

        if (SOLICITADO.equals(request.getEstado())) {
            validarSolicitud(request.getIdUsuario(), libro);
            notificar(request.getIdUsuario(),
                    "Enviaste la solicitud de préstamo de '" + libro.getTitulo() + "'. Te avisaremos cuando la revisen.");
        }

        // Un préstamo que se registra ya "devuelto" es solo historial: no toca el libro
        if (ACTIVO.equals(request.getEstado())) {
            long activos = prestamoRepository.countByIdUsuarioAndEstado(request.getIdUsuario(), ACTIVO);
            if (activos >= MAX_PRESTAMOS_ACTIVOS) {
                throw new ReglaNegocioException(
                        "El usuario ya tiene " + MAX_PRESTAMOS_ACTIVOS + " préstamos activos; debe devolver uno antes");
            }
            ocuparLibro(libro, request.getIdUsuario());
            notificar(request.getIdUsuario(),
                    "Se registró tu préstamo de '" + libro.getTitulo() + "'. Devuélvelo antes del " + fechaDevolucion + ".");
        }

        return prestamoRepository.save(prestamo);
    }

    @Transactional
    public Prestamo actualizar(Long id, PrestamoRequest request) {
        Prestamo prestamo = buscarPorId(id);

        if (!Objects.equals(prestamo.getIdUsuario(), request.getIdUsuario())
                || !Objects.equals(prestamo.getIdLibro(), request.getIdLibro())) {
            throw new ReglaNegocioException(
                    "No se puede cambiar el usuario ni el libro de un préstamo; elimínalo y registra otro");
        }
        if (DEVUELTO.equals(prestamo.getEstado()) && ACTIVO.equals(request.getEstado())) {
            throw new ReglaNegocioException("Un préstamo devuelto no puede reactivarse; registra uno nuevo");
        }
        if (!Objects.equals(prestamo.getEstado(), request.getEstado())
                && (SOLICITADO.equals(prestamo.getEstado()) || RECHAZADO.equals(prestamo.getEstado())
                    || SOLICITADO.equals(request.getEstado()) || RECHAZADO.equals(request.getEstado()))) {
            throw new ReglaNegocioException("Las solicitudes se aprueban o rechazan con sus propias acciones");
        }

        LocalDate fechaDevolucion = request.getFechaDevolucion() != null
                ? request.getFechaDevolucion()
                : prestamo.getFechaDevolucion();
        validarFechas(request.getFechaPrestamo(), fechaDevolucion);
        prestamo.setFechaPrestamo(request.getFechaPrestamo());
        prestamo.setFechaDevolucion(fechaDevolucion);

        if (ACTIVO.equals(prestamo.getEstado()) && DEVUELTO.equals(request.getEstado())) {
            marcarDevuelto(prestamo);
        }

        return prestamoRepository.save(prestamo);
    }

    /** El bibliotecario entrega el libro: la solicitud pasa a préstamo activo desde hoy. */
    @Transactional
    public Prestamo aprobar(Long id) {
        Prestamo prestamo = buscarPorId(id);
        if (!SOLICITADO.equals(prestamo.getEstado())) {
            throw new ReglaNegocioException("Solo se pueden aprobar solicitudes pendientes");
        }
        Libro libro = libroRepository.findById(prestamo.getIdLibro())
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe el libro con id " + prestamo.getIdLibro()));

        long activos = prestamoRepository.countByIdUsuarioAndEstado(prestamo.getIdUsuario(), ACTIVO);
        if (activos >= MAX_PRESTAMOS_ACTIVOS) {
            throw new ReglaNegocioException(
                    "El usuario ya tiene " + MAX_PRESTAMOS_ACTIVOS + " préstamos activos; debe devolver uno antes");
        }
        ocuparLibro(libro, prestamo.getIdUsuario());

        LocalDate hoy = LocalDate.now();
        prestamo.setFechaPrestamo(hoy);
        prestamo.setFechaDevolucion(hoy.plusDays(DIAS_PRESTAMO));
        prestamo.setEstado(ACTIVO);
        notificar(prestamo.getIdUsuario(),
                "Aprobaron tu préstamo de '" + libro.getTitulo() + "'. Devuélvelo antes del " + prestamo.getFechaDevolucion() + ".");
        return prestamoRepository.save(prestamo);
    }

    @Transactional
    public Prestamo rechazar(Long id) {
        Prestamo prestamo = buscarPorId(id);
        if (!SOLICITADO.equals(prestamo.getEstado())) {
            throw new ReglaNegocioException("Solo se pueden rechazar solicitudes pendientes");
        }
        prestamo.setEstado(RECHAZADO);
        String titulo = libroRepository.findById(prestamo.getIdLibro()).map(Libro::getTitulo).orElse("el libro");
        notificar(prestamo.getIdUsuario(), "Tu solicitud de préstamo de '" + titulo + "' fue rechazada.");
        return prestamoRepository.save(prestamo);
    }

    @Transactional
    public Prestamo devolver(Long id) {
        Prestamo prestamo = buscarPorId(id);
        if (!ACTIVO.equals(prestamo.getEstado())) {
            throw new ReglaNegocioException("Este préstamo ya fue devuelto");
        }
        marcarDevuelto(prestamo);
        return prestamoRepository.save(prestamo);
    }

    @Transactional
    public void eliminar(Long id) {
        Prestamo prestamo = buscarPorId(id);
        prestamoRepository.delete(prestamo);

        // Borrar un préstamo activo no puede dejar el libro "prestado" para siempre
        if (ACTIVO.equals(prestamo.getEstado())) {
            libroRepository.findById(prestamo.getIdLibro()).ifPresent(reservaService::liberarLibro);
        }
    }

    private void validarSolicitud(Long idUsuario, Libro libro) {
        if (prestamoRepository.existsByIdUsuarioAndIdLibroAndEstado(idUsuario, libro.getIdLibro(), SOLICITADO)) {
            throw new ReglaNegocioException("Ya enviaste una solicitud para '" + libro.getTitulo() + "'");
        }
        long ocupados = prestamoRepository.countByIdUsuarioAndEstado(idUsuario, ACTIVO)
                + prestamoRepository.countByIdUsuarioAndEstado(idUsuario, SOLICITADO);
        if (ocupados >= MAX_PRESTAMOS_ACTIVOS) {
            throw new ReglaNegocioException(
                    "Ya tienes " + MAX_PRESTAMOS_ACTIVOS + " préstamos entre activos y solicitados");
        }
        boolean apartadoParaEl = reservaService.buscarReservaLista(libro.getIdLibro())
                .map(r -> Objects.equals(r.getIdUsuario(), idUsuario))
                .orElse(false);
        if (!Boolean.TRUE.equals(libro.getDisponible()) && !apartadoParaEl) {
            throw new ReglaNegocioException("'" + libro.getTitulo() + "' no está disponible; puedes reservarlo");
        }
    }

    private void ocuparLibro(Libro libro, Long idUsuario) {
        Optional<Reserva> apartada = reservaService.buscarReservaLista(libro.getIdLibro());

        if (apartada.isPresent()) {
            if (!Objects.equals(apartada.get().getIdUsuario(), idUsuario)) {
                throw new ReglaNegocioException(
                        "'" + libro.getTitulo() + "' está apartado para el usuario que lo reservó");
            }
            reservaService.cerrarPorEntrega(apartada.get());
        } else if (!Boolean.TRUE.equals(libro.getDisponible())) {
            throw new ReglaNegocioException(
                    "'" + libro.getTitulo() + "' no está disponible; puedes reservarlo");
        }

        libro.setDisponible(false);
        libroRepository.save(libro);
    }

    private void marcarDevuelto(Prestamo prestamo) {
        prestamo.setEstado(DEVUELTO);
        libroRepository.findById(prestamo.getIdLibro()).ifPresent(reservaService::liberarLibro);
    }

    private void validarFechas(LocalDate fechaPrestamo, LocalDate fechaDevolucion) {
        if (fechaDevolucion != null && fechaDevolucion.isBefore(fechaPrestamo)) {
            throw new ReglaNegocioException("La fecha de devolución no puede ser anterior a la del préstamo");
        }
    }

    private void notificar(Long idUsuario, String mensaje) {
        Notificacion notificacion = new Notificacion();
        notificacion.setIdUsuario(idUsuario);
        notificacion.setMensaje(mensaje);
        notificacion.setTipo("prestamo");
        notificacionRepository.save(notificacion);
    }
}
