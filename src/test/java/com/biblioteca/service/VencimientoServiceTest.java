package com.biblioteca.service;

import com.biblioteca.model.Libro;
import com.biblioteca.model.Notificacion;
import com.biblioteca.model.Prestamo;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.NotificacionRepository;
import com.biblioteca.repository.PrestamoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VencimientoServiceTest {

    private static final LocalDate HOY = LocalDate.of(2026, 10, 21);

    @Mock
    private PrestamoRepository prestamoRepository;

    @Mock
    private LibroRepository libroRepository;

    @Mock
    private NotificacionRepository notificacionRepository;

    @InjectMocks
    private VencimientoService vencimientoService;

    @BeforeEach
    void libro() {
        Libro libro = new Libro();
        libro.setIdLibro(1L);
        libro.setTitulo("Terramar");
        org.mockito.Mockito.lenient().when(libroRepository.findById(1L)).thenReturn(Optional.of(libro));
    }

    @Test
    void avisaDosDiasAntesDelVencimiento() {
        when(prestamoRepository.findByEstadoAndFechaDevolucion("activo", HOY.plusDays(2)))
                .thenReturn(List.of(prestamo(7L, HOY.plusDays(2))));

        int creadas = vencimientoService.generarAvisos(HOY);

        assertEquals(1, creadas);
        ArgumentCaptor<Notificacion> captor = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository).save(captor.capture());
        assertEquals("recordatorio", captor.getValue().getTipo());
        assertEquals(7L, captor.getValue().getIdUsuario());
        assertTrue(captor.getValue().getMensaje().contains("Terramar"));
    }

    @Test
    void avisaDeLosPrestamosVencidosConLosDiasDeRetraso() {
        when(prestamoRepository.findByEstadoAndFechaDevolucionBefore("activo", HOY))
                .thenReturn(List.of(prestamo(7L, HOY.minusDays(3))));

        int creadas = vencimientoService.generarAvisos(HOY);

        assertEquals(1, creadas);
        ArgumentCaptor<Notificacion> captor = ArgumentCaptor.forClass(Notificacion.class);
        verify(notificacionRepository).save(captor.capture());
        assertEquals("vencido", captor.getValue().getTipo());
        assertTrue(captor.getValue().getMensaje().contains("3 días de retraso"));
    }

    @Test
    void noRepiteElMismoAvisoElMismoDia() {
        when(prestamoRepository.findByEstadoAndFechaDevolucionBefore("activo", HOY))
                .thenReturn(List.of(prestamo(7L, HOY.minusDays(1))));
        when(notificacionRepository.existsByIdUsuarioAndTipoAndMensajeAndFechaAfter(
                eq(7L), eq("vencido"), any(String.class), eq(HOY.atStartOfDay()))).thenReturn(true);

        int creadas = vencimientoService.generarAvisos(HOY);

        assertEquals(0, creadas);
        verify(notificacionRepository, never()).save(any(Notificacion.class));
    }

    @Test
    void sinPrestamosPorVencerNoCreaNada() {
        assertEquals(0, vencimientoService.generarAvisos(HOY));
        verify(notificacionRepository, never()).save(any(Notificacion.class));
    }

    private Prestamo prestamo(Long idUsuario, LocalDate fechaDevolucion) {
        Prestamo prestamo = new Prestamo();
        prestamo.setIdUsuario(idUsuario);
        prestamo.setIdLibro(1L);
        prestamo.setEstado("activo");
        prestamo.setFechaPrestamo(fechaDevolucion.minusDays(14));
        prestamo.setFechaDevolucion(fechaDevolucion);
        return prestamo;
    }
}
