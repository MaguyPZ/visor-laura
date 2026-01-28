/**
 * MicropauseBadgeComponent - Badge overlay para micro-pausas
 * 
 * Muestra micro-pausas sospechosas durante reproducción
 * Con duración, nivel de sospecha y contexto
 */
class MicropauseBadgeComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'MicropauseBadgeComponent',
            debug: true,
            colors: {
                micropause: '#f97316'  // Naranja
            }
        });

        this.currentPause = null;
        this.isVisible = false;
    }

    /**
     * Validar datos de micro-pausa
     */
    validate(data) {
        if (!super.validate(data)) return false;

        if (!data.pause) {
            this.log('No pause data provided', 'warn');
            return false;
        }

        return true;
    }

    /**
     * Mostrar badge con micro-pausa
     */
    show(pause, timeline = []) {
        if (!this.validate({ pause })) return;

        this.currentPause = pause;
        this.timeline = timeline;
        this.isVisible = true;
        this.render();

        this.log(`Showing micropause: ${pause.gap_seconds}s gap`, 'info');
    }

    /**
     * Ocultar badge
     */
    hide() {
        this.isVisible = false;
        const badge = this.element.querySelector('.micropause-badge');
        if (badge) {
            badge.classList.remove('visible');
        }

        this.log('Hiding micropause badge', 'info');
    }

    /**
     * Renderizar badge
     */
    render() {
        if (!this.currentPause) return;

        const p = this.currentPause;
        const duracion = `${(p.gap_seconds || 0).toFixed(2)}s`;
        const nivel = p.nivel_sospecha || 'MEDIO';
        const speaker = p.speaker || 'SPEAKER';
        const antesNegacion = p.es_antes_negacion ? '⚠️ ANTES DE NEGACIÓN' : '';

        // Obtener contexto del timeline si está disponible
        let contexto = 'Pausa sospechosa detectada';
        if (this.timeline && this.timeline.length > 0) {
            const segAnterior = this.timeline[p.segmento_anterior_id];
            const segSiguiente = this.timeline[p.segmento_siguiente_id];

            if (segAnterior && segSiguiente) {
                const textoAnterior = (segAnterior.transcripcion || '').slice(-50);
                const textoSiguiente = (segSiguiente.transcripcion || '').slice(0, 50);
                contexto = `"...${textoAnterior}" ⏸️ "${textoSiguiente}..."`;
            }
        }

        const colorNivel = {
            'ALTO': '#ef4444',
            'MEDIO': '#f97316',
            'BAJO': '#eab308'
        }[nivel] || '#f97316';

        this.element.innerHTML = `
            <div class="micropause-badge ${this.isVisible ? 'visible' : ''}">
                <div class="micropause-header">
                    <span class="micropause-icon">⏸️</span>
                    <span class="micropause-title">MICRO-PAUSA ${nivel}</span>
                </div>
                <div class="micropause-text">
                    <div style="margin-bottom: 8px;">
                        <strong>Duración:</strong> ${duracion} | 
                        <strong>Speaker:</strong> ${speaker}
                    </div>
                    ${antesNegacion ? `<div style="color: #ef4444; font-weight: bold; margin-bottom: 6px;">${antesNegacion}</div>` : ''}
                    <div style="font-size: 13px; font-style: italic; color: #ccc;">
                        ${contexto}
                    </div>
                </div>
            </div>
        `;

        this.log('Rendered micropause badge', 'success');
    }

    /**
     * Actualizar durante simulación
     */
    update(data) {
        // Este componente se controla manualmente con show/hide
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MicropauseBadgeComponent;
}
