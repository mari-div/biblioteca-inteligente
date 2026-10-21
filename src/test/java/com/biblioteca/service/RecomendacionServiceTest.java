package com.biblioteca.service;

import com.biblioteca.dto.SugerenciaResponse;
import com.biblioteca.exception.RecursoNoEncontradoException;
import com.biblioteca.model.Calificacion;
import com.biblioteca.model.Genero;
import com.biblioteca.model.Libro;
import com.biblioteca.model.Usuario;
import com.biblioteca.repository.CalificacionRepository;
import com.biblioteca.repository.GeneroRepository;
import com.biblioteca.repository.LibroRepository;
import com.biblioteca.repository.RecomendacionRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class RecomendacionServiceTest {

    @Autowired
    private RecomendacionService recomendacionService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private GeneroRepository generoRepository;

    @Autowired
    private CalificacionRepository calificacionRepository;

    @Autowired
    private RecomendacionRepository recomendacionRepository;

    @Test
    void sugiereLibrosNoLeidosDelGeneroMejorCalificado() {
        Usuario usuario = usuario();
        Genero fantasia = genero("Fantasía");
        Genero ensayo = genero("Ensayo");
        Libro leido = libro("Terramar", fantasia);
        Libro mismoGenero = libro("Otro de fantasía", fantasia);
        libro("Un ensayo", ensayo);
        calificar(usuario, leido, 5);

        List<SugerenciaResponse> sugerencias = recomendacionService.sugerir(usuario.getIdUsuario());

        assertEquals(mismoGenero.getIdLibro(), sugerencias.get(0).idLibro());
        assertTrue(sugerencias.get(0).motivo().contains("Fantasía"));
        assertTrue(sugerencias.stream().noneMatch(s -> s.idLibro().equals(leido.getIdLibro())));
    }

    @Test
    void sinHistorialSugiereLibrosDisponibles() {
        Usuario usuario = usuario();
        Libro libro = libro("Disponible", genero("Cuento"));

        List<SugerenciaResponse> sugerencias = recomendacionService.sugerir(usuario.getIdUsuario());

        assertEquals(1, sugerencias.size());
        assertEquals(libro.getIdLibro(), sugerencias.get(0).idLibro());
    }

    @Test
    void generarGuardaLasSugerenciasUnaSolaVez() {
        Usuario usuario = usuario();
        libro("Disponible", genero("Cuento"));

        assertEquals(1, recomendacionService.generar(usuario.getIdUsuario()).size());
        assertEquals(0, recomendacionService.generar(usuario.getIdUsuario()).size());
        assertEquals(1, recomendacionRepository.count());
    }

    @Test
    void usuarioInexistenteDevuelveNoEncontrado() {
        assertThrows(RecursoNoEncontradoException.class, () -> recomendacionService.sugerir(987654L));
    }

    private Usuario usuario() {
        Usuario usuario = new Usuario();
        usuario.setNombre("Lola");
        usuario.setEmail("lola@reco.com");
        usuario.setPassword("x");
        usuario.setRol("lector");
        return usuarioRepository.save(usuario);
    }

    private Genero genero(String nombre) {
        Genero genero = new Genero();
        genero.setNombre(nombre);
        return generoRepository.save(genero);
    }

    private Libro libro(String titulo, Genero genero) {
        Libro libro = new Libro();
        libro.setTitulo(titulo);
        libro.setIdGenero(genero.getIdGenero());
        libro.setDisponible(true);
        return libroRepository.save(libro);
    }

    private void calificar(Usuario usuario, Libro libro, int puntuacion) {
        Calificacion calificacion = new Calificacion();
        calificacion.setIdUsuario(usuario.getIdUsuario());
        calificacion.setIdLibro(libro.getIdLibro());
        calificacion.setPuntuacion(puntuacion);
        calificacionRepository.save(calificacion);
    }
}
