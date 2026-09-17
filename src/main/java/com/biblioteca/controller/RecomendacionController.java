package com.biblioteca.controller;

import com.biblioteca.dto.RecomendacionRequest;
import com.biblioteca.model.Recomendacion;
import com.biblioteca.service.RecomendacionService;
import jakarta.validation.Valid;
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
    public Recomendacion guardar(
            @Valid @RequestBody RecomendacionRequest request) {

        Recomendacion recomendacion = new Recomendacion();
        recomendacion.setIdUsuario(request.getIdUsuario());
        recomendacion.setIdLibro(request.getIdLibro());
        recomendacion.setMotivo(request.getMotivo());

        return recomendacionService.guardar(recomendacion);
    }

    @PutMapping("/{id}")
    public Recomendacion actualizar(
            @PathVariable Long id,
            @Valid @RequestBody RecomendacionRequest request) {

        Recomendacion recomendacion = new Recomendacion();
        recomendacion.setIdUsuario(request.getIdUsuario());
        recomendacion.setIdLibro(request.getIdLibro());
        recomendacion.setMotivo(request.getMotivo());

        return recomendacionService.actualizar(id, recomendacion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        recomendacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}