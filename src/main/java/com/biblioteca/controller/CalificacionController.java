package com.biblioteca.controller;

import com.biblioteca.dto.CalificacionRequest;
import com.biblioteca.model.Calificacion;
import com.biblioteca.service.CalificacionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calificaciones")
public class CalificacionController {

    private final CalificacionService calificacionService;

    public CalificacionController(CalificacionService calificacionService) {
        this.calificacionService = calificacionService;
    }

    @GetMapping
    public List<Calificacion> listar() {
        return calificacionService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Calificacion> buscarPorId(@PathVariable Long id) {
        return calificacionService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Calificacion guardar(
            @Valid @RequestBody CalificacionRequest request) {

        Calificacion calificacion = new Calificacion();
        calificacion.setIdUsuario(request.getIdUsuario());
        calificacion.setIdLibro(request.getIdLibro());
        calificacion.setPuntuacion(request.getPuntuacion());
        calificacion.setComentario(request.getComentario());

        return calificacionService.guardar(calificacion);
    }

    @PutMapping("/{id}")
    public Calificacion actualizar(
            @PathVariable Long id,
            @Valid @RequestBody CalificacionRequest request) {

        Calificacion calificacion = new Calificacion();
        calificacion.setIdUsuario(request.getIdUsuario());
        calificacion.setIdLibro(request.getIdLibro());
        calificacion.setPuntuacion(request.getPuntuacion());
        calificacion.setComentario(request.getComentario());

        return calificacionService.actualizar(id, calificacion);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        calificacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}