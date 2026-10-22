package com.biblioteca.scheduler;

import com.biblioteca.service.VencimientoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class VencimientoScheduler {

    private static final Logger log = LoggerFactory.getLogger(VencimientoScheduler.class);

    private final VencimientoService vencimientoService;

    public VencimientoScheduler(VencimientoService vencimientoService) {
        this.vencimientoService = vencimientoService;
    }

    /** Cada día a las 8:00. Se puede cambiar con la propiedad app.avisos.cron. */
    @Scheduled(cron = "${app.avisos.cron:0 0 8 * * *}")
    public void avisarVencimientos() {
        int creadas = vencimientoService.generarAvisos(LocalDate.now());
        log.info("Avisos de vencimiento creados: {}", creadas);
    }
}
