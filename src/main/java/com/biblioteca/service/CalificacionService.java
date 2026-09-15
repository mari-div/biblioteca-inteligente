package com.biblioteca.service;

import com.biblioteca.model.Calificacion;
import com.biblioteca.repository.CalificacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;

    public CalificacionService(CalificacionRepository calificacionRepository) {
        this.calificacionRepository = calificacionRepository;
    }

    public List<Calificacion> listar() {
        return calificacionRepository.findAll();
    }

    public Optional<Calificacion> buscarPorId(Long id) {
        return calificacionRepository.findById(id);
    }

    public Calificacion guardar(Calificacion calificacion) {
        return calificacionRepository.save(calificacion);
    }

    public Calificacion actualizar(Long id, Calificacion calificacion) {
        calificacion.setIdCalificacion(id);
        return calificacionRepository.save(calificacion);
    }

    public void eliminar(Long id) {
        calificacionRepository.deleteById(id);
    }
}