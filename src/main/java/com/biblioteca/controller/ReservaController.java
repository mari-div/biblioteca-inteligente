package com.biblioteca.controller;

import com.biblioteca.dto.ReservaRequest;
import com.biblioteca.model.Reserva;
import com.biblioteca.service.ReservaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;

    public ReservaController(ReservaService reservaService) {
        this.reservaService = reservaService;
    }

    @GetMapping
    public List<Reserva> listar() {
        return reservaService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reserva> buscarPorId(@PathVariable Long id) {
        return reservaService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Reserva guardar(
            @Valid @RequestBody ReservaRequest request) {

        Reserva reserva = new Reserva();

        reserva.setIdUsuario(request.getIdUsuario());
        reserva.setIdLibro(request.getIdLibro());
        reserva.setEstado(request.getEstado());

        return reservaService.guardar(reserva);
    }

    @PutMapping("/{id}")
    public Reserva actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ReservaRequest request) {

        Reserva reserva = new Reserva();

        reserva.setIdUsuario(request.getIdUsuario());
        reserva.setIdLibro(request.getIdLibro());
        reserva.setEstado(request.getEstado());

        return reservaService.actualizar(id, reserva);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        reservaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}