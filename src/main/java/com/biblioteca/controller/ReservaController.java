package com.biblioteca.controller;

import com.biblioteca.dto.ReservaRequest;
import com.biblioteca.model.Reserva;
import com.biblioteca.service.ReservaService;
import com.biblioteca.security.UsuarioActual;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final ReservaService reservaService;
    private final UsuarioActual usuarioActual;

    public ReservaController(ReservaService reservaService, UsuarioActual usuarioActual) {
        this.reservaService = reservaService;
        this.usuarioActual = usuarioActual;
    }

    @GetMapping
    public List<Reserva> listar() {
        return reservaService.listar();
    }

    @GetMapping("/{id}")
    public Reserva buscarPorId(@PathVariable Long id) {
        return reservaService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Reserva guardar(@Valid @RequestBody ReservaRequest request, Authentication authentication) {
        usuarioActual.exigirPropio(authentication, request.getIdUsuario());
        return reservaService.registrar(request);
    }

    @PutMapping("/{id}")
    public Reserva actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ReservaRequest request) {

        return reservaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        reservaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
