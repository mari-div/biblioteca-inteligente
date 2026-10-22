package com.biblioteca.service;

import com.biblioteca.dto.PrestamoRequest;
import com.biblioteca.exception.ReglaNegocioException;
import com.biblioteca.model.Libro;
import com.biblioteca.model.Prestamo;
import com.biblioteca.model.Usuario;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.UsuarioRepository;
import com.biblioteca.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SolicitudPrestamoTest {

    @Autowired
    private PrestamoService prestamoService;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private MockMvc mockMvc;

    private Usuario lola;
    private Usuario biblio;
    private Libro libro;

    @BeforeEach
    void datos() {
        lola = usuario("Lola", "lola@sol.com", "lector");
        biblio = usuario("Bea", "bea@sol.com", "bibliotecario");
        libro = libro("Terramar", "111");
    }

    @Test
    void unaSolicitudNoOcupaElLibro() {
        Prestamo solicitud = prestamoService.registrar(solicitud(lola, libro));

        assertEquals(PrestamoService.SOLICITADO, solicitud.getEstado());
        assertTrue(libroRepository.findById(libro.getIdLibro()).orElseThrow().getDisponible());
    }

    @Test
    void aprobarActivaElPrestamoDesdeHoyYOcupaElLibro() {
        Prestamo solicitud = prestamoService.registrar(solicitud(lola, libro));

        Prestamo aprobado = prestamoService.aprobar(solicitud.getIdPrestamo());

        assertEquals(PrestamoService.ACTIVO, aprobado.getEstado());
        assertEquals(LocalDate.now(), aprobado.getFechaPrestamo());
        assertEquals(LocalDate.now().plusDays(14), aprobado.getFechaDevolucion());
        assertFalse(libroRepository.findById(libro.getIdLibro()).orElseThrow().getDisponible());
    }

    @Test
    void rechazarNoTocaElLibroYNoSePuedeAprobarDespues() {
        Prestamo solicitud = prestamoService.registrar(solicitud(lola, libro));

        assertEquals(PrestamoService.RECHAZADO, prestamoService.rechazar(solicitud.getIdPrestamo()).getEstado());
        assertTrue(libroRepository.findById(libro.getIdLibro()).orElseThrow().getDisponible());
        assertThrows(ReglaNegocioException.class, () -> prestamoService.aprobar(solicitud.getIdPrestamo()));
    }

    @Test
    void noSePuedeSolicitarDosVecesElMismoLibro() {
        prestamoService.registrar(solicitud(lola, libro));

        assertThrows(ReglaNegocioException.class, () -> prestamoService.registrar(solicitud(lola, libro)));
    }

    @Test
    void noSePuedeSolicitarUnLibroPrestado() {
        libro.setDisponible(false);
        libroRepository.save(libro);

        assertThrows(ReglaNegocioException.class, () -> prestamoService.registrar(solicitud(lola, libro)));
    }

    @Test
    void elPrestamoDeUnLectorSiempreLlegaComoSolicitud() throws Exception {
        mockMvc.perform(post("/api/prestamos")
                        .header("Authorization", bearer(lola))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(lola, "activo")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.estado").value("solicitado"));
    }

    @Test
    void soloElPersonalPuedeAprobar() throws Exception {
        Prestamo solicitud = prestamoService.registrar(solicitud(lola, libro));

        mockMvc.perform(put("/api/prestamos/" + solicitud.getIdPrestamo() + "/aprobar").header("Authorization", bearer(lola)))
                .andExpect(status().isForbidden());
        mockMvc.perform(put("/api/prestamos/" + solicitud.getIdPrestamo() + "/aprobar").header("Authorization", bearer(biblio)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("activo"));
    }

    private PrestamoRequest solicitud(Usuario usuario, Libro libro) {
        PrestamoRequest request = new PrestamoRequest();
        request.setIdUsuario(usuario.getIdUsuario());
        request.setIdLibro(libro.getIdLibro());
        request.setFechaPrestamo(LocalDate.now());
        request.setEstado(PrestamoService.SOLICITADO);
        return request;
    }

    private String json(Usuario usuario, String estado) {
        return "{\"idUsuario\":" + usuario.getIdUsuario() + ",\"idLibro\":" + libro.getIdLibro()
                + ",\"fechaPrestamo\":\"" + LocalDate.now() + "\",\"estado\":\"" + estado + "\"}";
    }

    private String bearer(Usuario usuario) {
        return "Bearer " + jwtService.generarToken(usuario);
    }

    private Usuario usuario(String nombre, String email, String rol) {
        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        usuario.setPassword("x");
        usuario.setRol(rol);
        return usuarioRepository.save(usuario);
    }

    private Libro libro(String titulo, String isbn) {
        Libro nuevo = new Libro();
        nuevo.setTitulo(titulo);
        nuevo.setIsbn(isbn);
        nuevo.setDisponible(true);
        return libroRepository.save(nuevo);
    }
}
