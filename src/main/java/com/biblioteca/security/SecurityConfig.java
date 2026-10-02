package com.biblioteca.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Reglas de acceso de la API, resumidas:
 *
 *  - /api/auth/**                          públicas (login y registro)
 *  - GET  libros / autores / generos       cualquier usuario autenticado
 *  - POST/PUT/DELETE libros/autores/generos solo BIBLIOTECARIO o ADMINISTRADOR
 *  - /api/usuarios/**                      solo ADMINISTRADOR
 *  - POST prestamos / reservas             cualquier usuario autenticado (autoservicio)
 *  - PUT/DELETE prestamos / reservas       solo BIBLIOTECARIO o ADMINISTRADOR
 *  - DELETE calificaciones                 solo BIBLIOTECARIO o ADMINISTRADOR
 *  - resto de rutas autenticadas           cualquier usuario autenticado
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationEntryPoint authenticationEntryPoint;
    private final JwtAccessDeniedHandler accessDeniedHandler;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter,
                           CustomUserDetailsService userDetailsService,
                           JwtAuthenticationEntryPoint authenticationEntryPoint,
                           JwtAccessDeniedHandler accessDeniedHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.authenticationEntryPoint = authenticationEntryPoint;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // En desarrollo el frontend corre en :5173 (Vite) y el backend en :8080.
        // Si despliegas en otro dominio, agrégalo aquí.
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authenticationEntryPoint)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        // Catálogo: lectura para cualquier autenticado, escritura solo para staff
                        .requestMatchers(HttpMethod.GET, "/api/libros/**", "/api/autores/**", "/api/generos/**")
                            .authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/libros/**", "/api/autores/**", "/api/generos/**")
                            .hasAnyRole("BIBLIOTECARIO", "ADMINISTRADOR")
                        .requestMatchers(HttpMethod.PUT, "/api/libros/**", "/api/autores/**", "/api/generos/**")
                            .hasAnyRole("BIBLIOTECARIO", "ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/libros/**", "/api/autores/**", "/api/generos/**")
                            .hasAnyRole("BIBLIOTECARIO", "ADMINISTRADOR")

                        // Usuarios: administración exclusiva del rol administrador
                        .requestMatchers("/api/usuarios/**").hasRole("ADMINISTRADOR")

                        // Préstamos y reservas: cualquiera puede solicitar los suyos,
                        // pero solo el personal de biblioteca gestiona el estado/edición/borrado
                        .requestMatchers(HttpMethod.PUT, "/api/prestamos/**", "/api/reservas/**")
                            .hasAnyRole("BIBLIOTECARIO", "ADMINISTRADOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/prestamos/**", "/api/reservas/**")
                            .hasAnyRole("BIBLIOTECARIO", "ADMINISTRADOR")

                        // Calificaciones: cualquiera autenticado puede crear/ver las suyas;
                        // borrar (moderar) queda para el staff
                        .requestMatchers(HttpMethod.DELETE, "/api/calificaciones/**")
                            .hasAnyRole("BIBLIOTECARIO", "ADMINISTRADOR")

                        // Todo lo demás: basta con estar autenticado
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
