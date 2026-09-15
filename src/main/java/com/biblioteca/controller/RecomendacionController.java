package com.biblioteca.controller;

import com.biblioteca.model.Recomendacion;
import com.biblioteca.service.RecomendacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recomendaciones")
public class RecomendacionController {

    private final RecomendacionService recomendacionService;

    public RecomendacionController(RecomendacionService recomendacionService) {
        this.recomendacionService = recomendacionService;
    }

    @GetMapping
    public List<Recomendacion> listar() {
        return recomendacionService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Recomendacion> buscarPorId(@PathVariable Long id) {
        return recomendacionService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Recomendacion guardar(@RequestBody Recomendacion recomendacion) {
        return recomendacionService.guardar(recomendacion);
    }

    @PutMapping("/{id}")
    public Recomendacion actualizar(
            @PathVariable Long id,
            @RequestBody Recomendacion recomendacion) {
        return recomendacionService.actualizar(id, recomendacion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        recomendacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}