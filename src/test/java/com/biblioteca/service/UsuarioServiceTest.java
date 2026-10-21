package com.biblioteca.service;

import com.biblioteca.dto.UsuarioRequest;
import com.biblioteca.dto.UsuarioResponse;
import com.biblioteca.model.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class UsuarioServiceTest {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private UsuarioRequest request(String email, String password) {
        UsuarioRequest request = new UsuarioRequest();
        request.setNombre("Ana");
        request.setEmail(email);
        request.setPassword(password);
        request.setRol("lector");
        return request;
    }

    @Test
    void crearGuardaLaContrasenaCifradaYNoLaDevuelve() {
        UsuarioResponse creado = usuarioService.crear(request("Ana@Test.com", "secreto1"));

        Usuario guardado = usuarioRepository.findById(creado.idUsuario()).orElseThrow();
        assertEquals("ana@test.com", guardado.getEmail());
        assertNotEquals("secreto1", guardado.getPassword());
        assertTrue(passwordEncoder.matches("secreto1", guardado.getPassword()));
    }

    @Test
    void crearConEmailDuplicadoDevuelve409() {
        usuarioService.crear(request("dup@test.com", "secreto1"));

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> usuarioService.crear(request("DUP@test.com", "secreto2")));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
    }

    @Test
    void crearSinContrasenaDevuelve400() {
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> usuarioService.crear(request("sin@test.com", null)));

        assertEquals(HttpStatus.BAD_REQUEST, error.getStatusCode());
    }

    @Test
    void actualizarSinContrasenaConservaLaActual() {
        UsuarioResponse creado = usuarioService.crear(request("keep@test.com", "secreto1"));
        String hashAntes = usuarioRepository.findById(creado.idUsuario()).orElseThrow().getPassword();

        usuarioService.actualizar(creado.idUsuario(), request("keep@test.com", null));

        String hashDespues = usuarioRepository.findById(creado.idUsuario()).orElseThrow().getPassword();
        assertEquals(hashAntes, hashDespues);
    }
}
