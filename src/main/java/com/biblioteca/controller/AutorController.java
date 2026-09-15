package com.biblioteca.controller;

import com.biblioteca.model.Autor;
import com.biblioteca.service.AutorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/autores")
public class AutorController {

    private final AutorService autorService;

    public AutorController(AutorService autorService) {
        this.autorService = autorService;
    }

    @GetMapping
    public List<Autor> listar() {
        return autorService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Autor> buscarPorId(@PathVariable Long id) {
        return autorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Autor guardar(@RequestBody Autor autor) {
        return autorService.guardar(autor);
    }

    @PutMapping("/{id}")
    public Autor actualizar(@PathVariable Long id,
                            @RequestBody Autor autor) {
        return autorService.actualizar(id, autor);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        autorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}