package com.biblioteca.controller;

import com.biblioteca.dto.LibroRequest;
import com.biblioteca.model.Libro;
import com.biblioteca.service.LibroService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/libros")
public class LibroController {

    private final LibroService libroService;

    public LibroController(LibroService libroService) {
        this.libroService = libroService;
    }

    @GetMapping
    public List<Libro> listar() {
        return libroService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Libro> buscarPorId(@PathVariable Long id) {
        return libroService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Libro guardar(@Valid @RequestBody LibroRequest request) {
        Libro libro = new Libro();

        libro.setTitulo(request.getTitulo());
        libro.setIdAutor(request.getIdAutor());
        libro.setIsbn(request.getIsbn());
        libro.setIdGenero(request.getIdGenero());
        libro.setDescripcion(request.getDescripcion());
        libro.setDisponible(request.getDisponible());

        return libroService.guardar(libro);
    }

    @PutMapping("/{id}")
    public Libro actualizar(
            @PathVariable Long id,
            @Valid @RequestBody LibroRequest request) {

        Libro libro = new Libro();

        libro.setTitulo(request.getTitulo());
        libro.setIdAutor(request.getIdAutor());
        libro.setIsbn(request.getIsbn());
        libro.setIdGenero(request.getIdGenero());
        libro.setDescripcion(request.getDescripcion());
        libro.setDisponible(request.getDisponible());

        return libroService.actualizar(id, libro);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        libroService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}