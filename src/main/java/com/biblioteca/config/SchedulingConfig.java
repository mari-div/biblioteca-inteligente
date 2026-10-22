package com.biblioteca.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Activa las tareas programadas (@Scheduled) de la aplicación. */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}