package com.biblioteca.controller;

import com.biblioteca.dto.PrestamoRequest;
import com.biblioteca.model.Prestamo;
import com.biblioteca.service.PrestamoService;
import com.biblioteca.security.UsuarioActual;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prestamos")
public class PrestamoController {

    private final PrestamoService prestamoService;
    private final UsuarioActual usuarioActual;

    public PrestamoController(PrestamoService prestamoService, UsuarioActual usuarioActual) {
        this.prestamoService = prestamoService;
        this.usuarioActual = usuarioActual;
    }

    @GetMapping
    public List<Prestamo> listar() {
        return prestamoService.listar();
    }

    @GetMapping("/{id}")
    public Prestamo buscarPorId(@PathVariable Long id) {
        return prestamoService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Prestamo guardar(@Valid @RequestBody PrestamoRequest request, Authentication authentication) {
        usuarioActual.exigirPropio(authentication, request.getIdUsuario());
        return prestamoService.registrar(request);
    }

    @PutMapping("/{id}")
    public Prestamo actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PrestamoRequest request) {

        return prestamoService.actualizar(id, request);
    }

    @PutMapping("/{id}/devolver")
    public Prestamo devolver(@PathVariable Long id) {
        return prestamoService.devolver(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        prestamoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
