package com.biblioteca.controller;

import com.biblioteca.model.Genero;
import com.biblioteca.service.GeneroService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/generos")
public class GeneroController {

    private final GeneroService generoService;

    public GeneroController(GeneroService generoService) {
        this.generoService = generoService;
    }

    @GetMapping
    public List<Genero> listar() {
        return generoService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Genero> buscarPorId(@PathVariable Long id) {
        return generoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Genero guardar(@RequestBody Genero genero) {
        return generoService.guardar(genero);
    }

    @PutMapping("/{id}")
    public Genero actualizar(@PathVariable Long id,
                             @RequestBody Genero genero) {
        return generoService.actualizar(id, genero);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        generoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}