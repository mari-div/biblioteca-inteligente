package com.biblioteca.security;

import com.biblioteca.model.Libro;
import com.biblioteca.model.Usuario;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SeguridadApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LibroRepository libroRepository;

    private Usuario lola;
    private Usuario beto;
    private Usuario admin;
    private Libro libro;

    @BeforeEach
    void datos() {
        lola = usuario("Lola", "lola@api.com", "lector");
        beto = usuario("Beto", "beto@api.com", "lector");
        admin = usuario("Admin", "admin@api.com", "administrador");

        libro = new Libro();
        libro.setTitulo("Terramar");
        libro.setDisponible(true);
        libro = libroRepository.save(libro);
    }

    @Test
    void sinTokenLaApiRespondeNoAutenticado() throws Exception {
        mockMvc.perform(get("/api/libros")).andExpect(status().isUnauthorized());
    }

    @Test
    void unLectorNoPuedeVerLaListaDeUsuarios() throws Exception {
        mockMvc.perform(get("/api/usuarios").header("Authorization", bearer(lola)))
                .andExpect(status().isForbidden());
    }

    @Test
    void laListaDeUsuariosNoIncluyeContrasenas() throws Exception {
        mockMvc.perform(get("/api/usuarios").header("Authorization", bearer(admin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].password").doesNotExist());
    }

    @Test
    void unLectorPuedePedirPrestadoUnLibroAsuNombre() throws Exception {
        mockMvc.perform(post("/api/prestamos")
                        .header("Authorization", bearer(lola))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(prestamoJson(lola)))
                .andExpect(status().isCreated());
    }

    @Test
    void unLectorNoPuedePedirPrestadoUnLibroANombreDeOtro() throws Exception {
        mockMvc.perform(post("/api/prestamos")
                        .header("Authorization", bearer(lola))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(prestamoJson(beto)))
                .andExpect(status().isForbidden());
    }

    @Test
    void unLectorNoPuedeReservarANombreDeOtro() throws Exception {
        mockMvc.perform(post("/api/reservas")
                        .header("Authorization", bearer(lola))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idUsuario\":" + beto.getIdUsuario() + ",\"idLibro\":" + libro.getIdLibro()
                                + ",\"estado\":\"pendiente\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void unLectorNoPuedeCalificarANombreDeOtro() throws Exception {
        mockMvc.perform(post("/api/calificaciones")
                        .header("Authorization", bearer(lola))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"idUsuario\":" + beto.getIdUsuario() + ",\"idLibro\":" + libro.getIdLibro()
                                + ",\"puntuacion\":5}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void elPersonalPuedeRegistrarUnPrestamoANombreDeUnLector() throws Exception {
        mockMvc.perform(post("/api/prestamos")
                        .header("Authorization", bearer(admin))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(prestamoJson(beto)))
                .andExpect(status().isCreated());
    }

    private String prestamoJson(Usuario usuario) {
        return "{\"idUsuario\":" + usuario.getIdUsuario() + ",\"idLibro\":" + libro.getIdLibro()
                + ",\"fechaPrestamo\":\"" + java.time.LocalDate.now() + "\",\"estado\":\"activo\"}";
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
}
