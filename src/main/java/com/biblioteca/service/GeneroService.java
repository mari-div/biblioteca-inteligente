package com.biblioteca.service;

import com.biblioteca.model.Genero;
import com.biblioteca.repository.GeneroRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GeneroService {

    private final GeneroRepository generoRepository;

    public GeneroService(GeneroRepository generoRepository) {
        this.generoRepository = generoRepository;
    }

    public List<Genero> listar() {
        return generoRepository.findAll();
    }

    public Optional<Genero> buscarPorId(Long id) {
        return generoRepository.findById(id);
    }

    public Genero guardar(Genero genero) {
        return generoRepository.save(genero);
    }

    public Genero actualizar(Long id, Genero genero) {
        genero.setIdGenero(id);
        return generoRepository.save(genero);
    }

    public void eliminar(Long id) {
        generoRepository.deleteById(id);
    }
}