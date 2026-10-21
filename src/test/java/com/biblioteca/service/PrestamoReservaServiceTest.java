package com.biblioteca.service;

import com.biblioteca.dto.PrestamoRequest;
import com.biblioteca.dto.ReservaRequest;
import com.biblioteca.exception.RecursoNoEncontradoException;
import com.biblioteca.exception.ReglaNegocioException;
import com.biblioteca.model.Libro;
import com.biblioteca.model.Prestamo;
import com.biblioteca.model.Reserva;
import com.biblioteca.model.Usuario;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.NotificacionRepository;
import com.biblioteca.repository.ReservaRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class PrestamoReservaServiceTest {

    @Autowired
    private PrestamoService prestamoService;

    @Autowired
    private ReservaService reservaService;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ReservaRepository reservaRepository;

    @Autowired
    private NotificacionRepository notificacionRepository;

    private Usuario lola;
    private Usuario beto;
    private Libro libro;

    @BeforeEach
    void datos() {
        lola = usuario("Lola", "lola@test.com");
        beto = usuario("Beto", "beto@test.com");
        libro = libro("Terramar", "111");
    }

    @Test
    void prestarMarcaElLibroComoNoDisponibleYFijaLaFechaDeDevolucion() {
        Prestamo prestamo = prestamoService.registrar(prestamo(lola, libro));

        assertFalse(libroRepository.findById(libro.getIdLibro()).orElseThrow().getDisponible());
        assertEquals(LocalDate.now().plusDays(14), prestamo.getFechaDevolucion());
    }

    @Test
    void noSePuedePrestarUnLibroQueYaEstaPrestado() {
        prestamoService.registrar(prestamo(lola, libro));

        assertThrows(ReglaNegocioException.class, () -> prestamoService.registrar(prestamo(beto, libro)));
    }

    @Test
    void unUsuarioNoPuedeTenerMasDeTresPrestamosActivos() {
        for (int i = 0; i < 3; i++) {
            prestamoService.registrar(prestamo(lola, libro("Libro " + i, "90" + i)));
        }

        assertThrows(ReglaNegocioException.class,
                () -> prestamoService.registrar(prestamo(lola, libro("Libro extra", "999"))));
    }

    @Test
    void usuarioInexistenteDevuelveNoEncontrado() {
        PrestamoRequest request = prestamo(lola, libro);
        request.setIdUsuario(987654L);

        assertThrows(RecursoNoEncontradoException.class, () -> prestamoService.registrar(request));
    }

    @Test
    void laFechaDeDevolucionNoPuedeSerAnteriorALaDelPrestamo() {
        PrestamoRequest request = prestamo(lola, libro);
        request.setFechaDevolucion(LocalDate.now().minusDays(1));

        assertThrows(ReglaNegocioException.class, () -> prestamoService.registrar(request));
    }

    @Test
    void noSePuedeReservarUnLibroDisponible() {
        assertThrows(ReglaNegocioException.class, () -> reservaService.registrar(reserva(beto, libro)));
    }

    @Test
    void noSePuedeTenerDosReservasActivasDelMismoLibro() {
        prestamoService.registrar(prestamo(lola, libro));
        reservaService.registrar(reserva(beto, libro));

        assertThrows(ReglaNegocioException.class, () -> reservaService.registrar(reserva(beto, libro)));
    }

    @Test
    void alDevolverElLibroQuedaApartadoParaElPrimeroDeLaCola() {
        Prestamo prestamo = prestamoService.registrar(prestamo(lola, libro));
        Reserva reserva = reservaService.registrar(reserva(beto, libro));
        assertEquals("pendiente", reserva.getEstado());

        prestamoService.devolver(prestamo.getIdPrestamo());

        assertEquals("lista", reservaRepository.findById(reserva.getIdReserva()).orElseThrow().getEstado());
        assertFalse(libroRepository.findById(libro.getIdLibro()).orElseThrow().getDisponible());
        assertTrue(notificacionRepository.findAll().stream()
                .anyMatch(n -> beto.getIdUsuario().equals(n.getIdUsuario())
                        && n.getMensaje().contains("ya está disponible")));
    }

    @Test
    void elLibroApartadoSoloSePrestaAQuienLoReservoYCierraSuReserva() {
        Prestamo prestamo = prestamoService.registrar(prestamo(lola, libro));
        Reserva reserva = reservaService.registrar(reserva(beto, libro));
        prestamoService.devolver(prestamo.getIdPrestamo());

        assertThrows(ReglaNegocioException.class, () -> prestamoService.registrar(prestamo(lola, libro)));

        prestamoService.registrar(prestamo(beto, libro));
        assertTrue(reservaRepository.findById(reserva.getIdReserva()).isEmpty());
    }

    @Test
    void sinReservasPendientesElLibroVuelveAEstarDisponible() {
        Prestamo prestamo = prestamoService.registrar(prestamo(lola, libro));

        prestamoService.devolver(prestamo.getIdPrestamo());

        assertTrue(libroRepository.findById(libro.getIdLibro()).orElseThrow().getDisponible());
    }

    @Test
    void unPrestamoDevueltoNoSePuedeDevolverDeNuevo() {
        Prestamo prestamo = prestamoService.registrar(prestamo(lola, libro));
        prestamoService.devolver(prestamo.getIdPrestamo());

        assertThrows(ReglaNegocioException.class, () -> prestamoService.devolver(prestamo.getIdPrestamo()));
    }

    private Usuario usuario(String nombre, String email) {
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        usuario.setPassword("x");
        usuario.setRol("lector");
        return usuarioRepository.save(usuario);
    }

    private Libro libro(String titulo, String isbn) {
        Libro nuevo = new Libro();
        nuevo.setTitulo(titulo);
        nuevo.setIsbn(isbn);
        nuevo.setDisponible(true);
        return libroRepository.save(nuevo);
    }

    private PrestamoRequest prestamo(Usuario usuario, Libro libro) {
        PrestamoRequest request = new PrestamoRequest();
        request.setIdUsuario(usuario.getIdUsuario());
        request.setIdLibro(libro.getIdLibro());
        request.setFechaPrestamo(LocalDate.now());
        request.setEstado("activo");
        return request;
    }

    private ReservaRequest reserva(Usuario usuario, Libro libro) {
        ReservaRequest request = new ReservaRequest();
        request.setIdUsuario(usuario.getIdUsuario());
        request.setIdLibro(libro.getIdLibro());
        request.setEstado("pendiente");
        return request;
    }
}
