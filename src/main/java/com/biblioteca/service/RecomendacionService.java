package com.biblioteca.service;

import com.biblioteca.model.Recomendacion;
import com.biblioteca.repository.RecomendacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecomendacionService {

    private final RecomendacionRepository recomendacionRepository;

    public RecomendacionService(RecomendacionRepository recomendacionRepository) {
        this.recomendacionRepository = recomendacionRepository;
    }

    public List<Recomendacion> listar() {
        return recomendacionRepository.findAll();
    }

    public Optional<Recomendacion> buscarPorId(Long id) {
        return recomendacionRepository.findById(id);
    }

    public Recomendacion guardar(Recomendacion recomendacion) {
        return recomendacionRepository.save(recomendacion);
    }

    public Recomendacion actualizar(Long id, Recomendacion recomendacion) {
        recomendacion.setIdRecomendacion(id);
        return recomendacionRepository.save(recomendacion);
    }

    public void eliminar(Long id) {
        recomendacionRepository.deleteById(id);
    }
}