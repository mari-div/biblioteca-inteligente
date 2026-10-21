package com.biblioteca.service;

import com.biblioteca.model.Libro;
import com.biblioteca.model.Notificacion;
import com.biblioteca.model.Prestamo;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.NotificacionRepository;
import com.biblioteca.repository.PrestamoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Genera las notificaciones de vencimiento:
 *  - "recordatorio": el préstamo vence dentro de DIAS_AVISO días.
 *  - "vencido": el préstamo ya pasó su fecha de devolución (un aviso por día).
 */
@Service
public class VencimientoService {

    public static final int DIAS_AVISO = 2;
    public static final String TIPO_RECORDATORIO = "recordatorio";
    public static final String TIPO_VENCIDO = "vencido";

    private final PrestamoRepository prestamoRepository;
    private final LibroRepository libroRepository;
    private final NotificacionRepository notificacionRepository;

    public VencimientoService(PrestamoRepository prestamoRepository,
                              LibroRepository libroRepository,
                              NotificacionRepository notificacionRepository) {
        this.prestamoRepository = prestamoRepository;
        this.libroRepository = libroRepository;
        this.notificacionRepository = notificacionRepository;
    }

    public List<Prestamo> listarVencidos() {
        return listarVencidos(LocalDate.now());
    }

    public List<Prestamo> listarVencidos(LocalDate hoy) {
        return prestamoRepository.findByEstadoAndFechaDevolucionBefore(PrestamoService.ACTIVO, hoy);
    }

    /** Crea los avisos de hoy. Devuelve cuántas notificaciones nuevas se crearon. */
    @Transactional
    public int generarAvisos(LocalDate hoy) {
        int creadas = 0;

        List<Prestamo> porVencer = prestamoRepository
                .findByEstadoAndFechaDevolucion(PrestamoService.ACTIVO, hoy.plusDays(DIAS_AVISO));
        for (Prestamo prestamo : porVencer) {
            String mensaje = "Tu préstamo de '" + titulo(prestamo) + "' vence el "
                    + prestamo.getFechaDevolucion() + " (en " + DIAS_AVISO + " días).";
            if (avisar(prestamo.getIdUsuario(), TIPO_RECORDATORIO, mensaje, hoy)) {
                creadas++;
            }
        }

        for (Prestamo prestamo : listarVencidos(hoy)) {
            long dias = ChronoUnit.DAYS.between(prestamo.getFechaDevolucion(), hoy);
            String mensaje = "Tu préstamo de '" + titulo(prestamo) + "' venció el "
                    + prestamo.getFechaDevolucion() + " (" + dias + (dias == 1 ? " día" : " días")
                    + " de retraso). Devuélvelo lo antes posible.";
            if (avisar(prestamo.getIdUsuario(), TIPO_VENCIDO, mensaje, hoy)) {
                creadas++;
            }
        }

        return creadas;
    }

    private boolean avisar(Long idUsuario, String tipo, String mensaje, LocalDate hoy) {
        if (notificacionRepository.existsByIdUsuarioAndTipoAndMensajeAndFechaAfter(
                idUsuario, tipo, mensaje, hoy.atStartOfDay())) {
            return false;
        }

        Notificacion notificacion = new Notificacion();
        notificacion.setIdUsuario(idUsuario);
        notificacion.setTipo(tipo);
        notificacion.setMensaje(mensaje);
        notificacionRepository.save(notificacion);
        return true;
    }

    private String titulo(Prestamo prestamo) {
        return libroRepository.findById(prestamo.getIdLibro())
                .map(Libro::getTitulo)
                .orElse("un libro");
    }
}
