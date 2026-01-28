/**
 * MicroPausasIndicator - Indicador de micro-pausas sospechosas
 * 
 * Muestra estadísticas y lista de micro-pausas detectadas
 */
class MicroPausasIndicator extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'MicroPausasIndicator',
            debug: true
        });

        this.microPausas = null;
    }

    /**
     * Cargar datos de micro-pausas
     */
    loadMicroPausas(microPausasData, timeline = []) {
        this.microPausas = microPausasData || {};
        this.timeline = timeline;
        this.renderIndicator();
        this.log(`Loaded micro-pausas: ${this.microPausas.total_micro_pausas || 0} total`);
    }

    /**
     * Renderizar indicador
     */
    renderIndicator() {
        const total = this.microPausas.total_micro_pausas || 0;
        const detalles = this.microPausas.detalles || [];

        // Contar por nivel
        const porNivel = {
            'BAJO': detalles.filter(p => p.nivel_sospecha === 'BAJO').length,
            'MEDIO': detalles.filter(p => p.nivel_sospecha === 'MEDIO').length,
            'ALTO': detalles.filter(p => p.nivel_sospecha === 'ALTO').length
        };

        const totalAlto = porNivel.ALTO;
        const color = totalAlto > 3 ? '#ef4444' : totalAlto > 0 ? '#eab308' : '#22c55e';

        this.element.innerHTML = `
            <div style="
                background: rgba(30, 30, 45, 0.8);
                border: 1px solid ${color};
                border-radius: 12px;
                overflow: hidden;
            ">
                <!-- Header -->
                <div style="
                    background: linear-gradient(135deg, ${this.getGradient(totalAlto)});
                    padding: 16px 20px;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span style="font-size: 24px;">⏸️</span>
                            <div>
                                <div style="color: white; font-weight: bold; font-size: 15px;">
                                    Micro-Pausas Detectadas
                                </div>
                                <div style="color: rgba(255,255,255,0.8); font-size: 12px;">
                                    ${total} pausas analizadas
                                </div>
                            </div>
                        </div>
                        <div style="
                            background: ${color};
                            color: white;
                            padding: 8px 16px;
                            border-radius: 20px;
                            font-weight: bold;
                            font-size: 20px;
                        ">
                            ${total}
                        </div>
                    </div>
                </div>
                
                <!-- Estadísticas -->
                <div style="padding: 20px;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                        ${this.renderStatCard('BAJO', porNivel.BAJO, '#22c55e')}
                        ${this.renderStatCard('MEDIO', porNivel.MEDIO, '#eab308')}
                        ${this.renderStatCard('ALTO', porNivel.ALTO, '#ef4444')}
                    </div>
                    
                    ${totalAlto > 0 ? `
                        <div style="
                            background: rgba(239, 68, 68, 0.1);
                            border-left: 3px solid #ef4444;
                            padding: 12px;
                            border-radius: 6px;
                            margin-bottom: 16px;
                        ">
                            <div style="color: #ef4444; font-size: 12px; font-weight: bold; margin-bottom: 4px;">
                                ⚠️ ALERTA
                            </div>
                            <div style="color: rgba(255,255,255,0.9); font-size: 13px;">
                                Detectadas ${totalAlto} micro-pausa${totalAlto > 1 ? 's' : ''} de nivel ALTO - requiere atención
                            </div>
                        </div>
                    ` : ''}
                    
                    <!-- Lista de pausas ALTO y MEDIO -->
                    ${detalles.filter(p => p.nivel_sospecha !== 'BAJO').length > 0 ? `
                        <div>
                            <h4 style="color: #94a3b8; font-size: 12px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                Pausas Sospechosas
                            </h4>
                            ${detalles
                    .filter(p => p.nivel_sospecha !== 'BAJO')
                    .slice(0, 5)
                    .map(pausa => this.renderPausa(pausa))
                    .join('')}
                        </div>
                    ` : `
                        <div style="text-align: center; padding: 20px; color: #22c55e;">
                            ✓ No se detectaron pausas sospechosas significativas
                        </div>
                    `}
                </div>
            </div>
        `;

        this.log('Indicator rendered');
    }

    /**
     * Renderizar tarjeta de estadística
     */
    renderStatCard(nivel, count, color) {
        return `
            <div style="
                background: rgba(0,0,0,0.3);
                padding: 12px;
                border-radius: 8px;
                text-align: center;
                border-top: 3px solid ${color};
            ">
                <div style="color: ${color}; font-size: 24px; font-weight: bold; margin-bottom: 4px;">
                    ${count}
                </div>
                <div style="color: rgba(255,255,255,0.7); font-size: 11px; text-transform: uppercase;">
                    ${nivel}
                </div>
            </div>
        `;
    }

    /**
     * Renderizar una pausa individual
     */
    renderPausa(pausa) {
        const nivel = pausa.nivel_sospecha || 'BAJO';
        const color = this.getNivelColor(nivel);

        // Manejar diferentes formatos de timestamp
        let timestamp = '';
        if (pausa.timestamp) {
            timestamp = pausa.timestamp;
        } else if (pausa.inicio_s !== undefined) {
            const mins = Math.floor(pausa.inicio_s / 60);
            const secs = (pausa.inicio_s % 60).toFixed(1);
            timestamp = `${mins}:${secs.padStart(4, '0')}`;
        }

        // Duración
        const duracion = pausa.duracion_ms || pausa.duracion_segundos || pausa.gap_seconds || 0;
        const duracionStr = duracion > 0
            ? (duracion < 1 ? `${(duracion * 1000).toFixed(0)}ms` : `${(duracion * 1000).toFixed(0)}ms`)
            : 'N/A';

        // Info adicional
        const speaker = pausa.speaker || '';
        const esAntesNegacion = pausa.es_antes_negacion;

        // Razón de sospecha
        let razon = pausa.razon_sospecha || pausa.motivo || '';
        if (!razon && esAntesNegacion) {
            razon = 'Antes de negación';
        } else if (!razon && duracion > 0.5) {
            razon = 'Pausa larga';
        }

        // Obtener contexto de transcripción del timeline
        const contexto = this.getTranscriptionContext(pausa);

        return `
            <div style="
                background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.2) 100%);
                border-left: 4px solid ${color};
                padding: 14px;
                border-radius: 8px;
                margin-bottom: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            ">
                <!-- Header con nivel y tiempo -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="
                            background: ${color};
                            color: white;
                            padding: 4px 10px;
                            border-radius: 12px;
                            font-size: 10px;
                            font-weight: bold;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        ">${nivel}</span>
                        ${razon ? `
                            <span style="color: #94a3b8; font-size: 11px; font-style: italic;">
                                ${razon}
                            </span>
                        ` : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${timestamp ? `
                            <span style="color: #64748b; font-size: 11px; font-weight: 500;">
                                ⏱️ ${timestamp}
                            </span>
                        ` : ''}
                        <span style="
                            background: rgba(100, 116, 139, 0.2);
                            color: #94a3b8;
                            padding: 3px 8px;
                            border-radius: 8px;
                            font-size: 10px;
                            font-weight: 600;
                        ">${duracionStr}</span>
                    </div>
                </div>
                
                <!-- Info adicional -->
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 10px 12px;
                    border-radius: 6px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: ${contexto ? '10px' : '0'};
                ">
                    ${speaker ? `
                        <div>
                            <span style="color: #64748b; font-size: 10px; font-weight: 600; text-transform: uppercase;">
                                Hablante:
                            </span>
                            <span style="color: rgba(255,255,255,0.85); font-size: 12px; margin-left: 4px;">
                                ${speaker}
                            </span>
                        </div>
                    ` : ''}
                    ${esAntesNegacion !== undefined ? `
                        <div>
                            <span style="
                                background: ${esAntesNegacion ? '#ef4444' : 'rgba(100, 116, 139, 0.3)'};
                                color: white;
                                padding: 3px 8px;
                                border-radius: 10px;
                                font-size: 10px;
                            ">
                                ${esAntesNegacion ? '⚠️ Antes negación' : '✓ Normal'}
                            </span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Contexto de transcripción -->
                ${contexto ? `
                    <div style="
                        background: rgba(59, 130, 246, 0.1);
                        border-left: 3px solid #3b82f6;
                        padding: 12px;
                        border-radius: 6px;
                    ">
                        ${contexto.antes ? `
                            <div style="margin-bottom: ${contexto.despues ? '10px' : '0'};">
                                <div style="color: #3b82f6; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">
                                    💬 Antes de la pausa:
                                </div>
                                <div style="color: rgba(255,255,255,0.9); font-size: 12px; line-height: 1.5; font-style: italic;">
                                    "${contexto.antes}"
                                </div>
                            </div>
                        ` : ''}
                        ${contexto.despues ? `
                            <div>
                                <div style="color: #22c55e; font-size: 10px; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">
                                    💬 Después de la pausa:
                                </div>
                                <div style="color: rgba(255,255,255,0.9); font-size: 12px; line-height: 1.5; font-style: italic;">
                                    "${contexto.despues}"
                                </div>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Truncar texto
     */
    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

/**
 * Obtener contexto de transcripción del timeline
 */
getTranscriptionContext(pausa) {
    if (!this.timeline || this.timeline.length === 0) {
        return null;
    }

    const segAnteriorId = pausa.segmento_anterior_id;
    const segSiguienteId = pausa.segmento_siguiente_id;

    let antes = '';
    let despues = '';

    // Buscar segmento anterior - usar índice directo
    if (segAnteriorId !== undefined && segAnteriorId >= 0 && segAnteriorId < this.timeline.length) {
        const segAnterior = this.timeline[segAnteriorId];
        if (segAnterior) {
            const texto = segAnterior.transcripcion || segAnterior.text || '';
            if (texto) {
                antes = this.truncate(texto, 150);
            }
        }
    }

    // Buscar segmento siguiente - usar índice directo
    if (segSiguienteId !== undefined && segSiguienteId >= 0 && segSiguienteId < this.timeline.length) {
        const segSiguiente = this.timeline[segSiguienteId];
        if (segSiguiente) {
            const texto = segSiguiente.transcripcion || segSiguiente.text || '';
            if (texto) {
                despues = this.truncate(texto, 150);
            }
        }
    }

    // Solo retornar si hay al menos uno
    if (antes || despues) {
        return { antes, despues };
    }

    return null;
}

    /**
     * Validar (componente estático)
     */
    validate(data) {
        return true;
    }

    /**
     * Render (componente estático)
     */
    render(data) {
        // No-op
    }

    /**
     * Obtener gradiente según nivel alto
     */
    getGradient(totalAlto) {
        if (totalAlto > 3) return '#991b1b 0%, #7f1d1d 100%';
        if (totalAlto > 0) return '#92400e 0%, #78350f 100%';
        return '#065f46 0%, #064e3b 100%';
    }

    /**
     * Obtener color según nivel
     */
    getNivelColor(nivel) {
        const colors = {
            'BAJO': '#22c55e',
            'MEDIO': '#eab308',
            'ALTO': '#ef4444'
        };
        return colors[nivel] || '#64748b';
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicroPausasIndicator;
}
