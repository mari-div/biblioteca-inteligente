package com.biblioteca.config;

import com.biblioteca.model.Usuario;
import com.biblioteca.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Al arrancar, cifra con BCrypt las contraseñas que aún estén en texto plano
 * (usuarios creados antes de este cambio). Las ya cifradas no se tocan.
 */
@Component
public class MigracionPasswordsRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(MigracionPasswordsRunner.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public MigracionPasswordsRunner(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        List<Usuario> pendientes = usuarioRepository.findAll().stream()
                .filter(u -> u.getPassword() != null && !esBcrypt(u.getPassword()))
                .toList();

        pendientes.forEach(u -> u.setPassword(passwordEncoder.encode(u.getPassword())));
        usuarioRepository.saveAll(pendientes);

        if (!pendientes.isEmpty()) {
            log.info("Contraseñas cifradas con BCrypt: {}", pendientes.size());
        }
    }

    private boolean esBcrypt(String password) {
        return password.matches("^\\$2[aby]\\$\\d{2}\\$.{53}$");
    }
}
