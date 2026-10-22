package com.biblioteca.controller;

import com.biblioteca.model.Prestamo;
import com.biblioteca.service.VencimientoService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@PreAuthorize("hasAnyRole('BIBLIOTECARIO', 'ADMINISTRADOR')")
public class VencimientoController {

    private final VencimientoService vencimientoService;

    public VencimientoController(VencimientoService vencimientoService) {
        this.vencimientoService = vencimientoService;
    }

    /** Préstamos activos cuya fecha de devolución ya pasó. */
    @GetMapping("/prestamos/vencidos")
    public List<Prestamo> vencidos() {
        return vencimientoService.listarVencidos();
    }

    /** Lanza los avisos de hoy sin esperar a la tarea programada. */
    @PostMapping("/avisos/ejecutar")
    public Map<String, Integer> ejecutarAvisos() {
        return Map.of("creadas", vencimientoService.generarAvisos(LocalDate.now()));
    }
}
