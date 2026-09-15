package com.biblioteca.service;

import com.biblioteca.model.Prestamo;
import com.biblioteca.repository.PrestamoRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PrestamoService {

    private final PrestamoRepository prestamoRepository;

    public PrestamoService(PrestamoRepository prestamoRepository) {
        this.prestamoRepository = prestamoRepository;
    }

    public List<Prestamo> listar() {
        return prestamoRepository.findAll();
    }

    public Optional<Prestamo> buscarPorId(Long id) {
        return prestamoRepository.findById(id);
    }

    public Prestamo guardar(Prestamo prestamo) {
        return prestamoRepository.save(prestamo);
    }

    public Prestamo actualizar(Long id, Prestamo prestamo) {
        prestamo.setIdPrestamo(id);
        return prestamoRepository.save(prestamo);
    }

    public void eliminar(Long id) {
        prestamoRepository.deleteById(id);
    }
}