/**
 * AlertasIndexComponent - Índice consolidado de alertas
 * 
 * Muestra conteo de todos los tipos de alertas
 * Con navegación rápida a cada categoría
 */
class AlertasIndexComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'AlertasIndexComponent',
            debug: true,
            colors: {
                redFlags: '#ef4444',
                suspicious: '#f97316',
                contradictions: '#a855f7',
                microPausas: '#f59e0b'
            }
        });

        this.alertas = {
            redFlags: 0,
            suspicious: 0,
            contradictions: 0,
            microPausas: 0
        };
    }

    /**
     * Cargar y contar todas las alertas
     */
    loadAlertas(visorData) {
        if (!visorData) {
            this.log('No visor data provided', 'warn');
            return;
        }

        // Contar Red Flags (ALTA importancia)
        if (visorData.momentos_criticos) {
            this.alertas.redFlags = visorData.momentos_criticos.filter(m => m.importancia === 'ALTA').length;
            this.alertas.suspicious = visorData.momentos_criticos.filter(m => m.importancia === 'MEDIA').length;
        }

        // Contar Contradicciones
        if (visorData.contradicciones_detectadas) {
            this.alertas.contradictions = visorData.contradicciones_detectadas.length;
        }

        // Contar Micro-pausas
        if (visorData.micro_pausas && visorData.micro_pausas.pausas_sospechosas) {
            this.alertas.microPausas = visorData.micro_pausas.pausas_sospechosas.length;
        }

        this.render();
        this.log(`Loaded alertas index: ${JSON.stringify(this.alertas)}`, 'success');
    }

    /**
     * Renderizar índice
     */
    render() {
        const total = Object.values(this.alertas).reduce((sum, val) => sum + val, 0);

        this.element.innerHTML = `
            <div class="alertas-index">
                <h3 style="color: #3b82f6; margin: 0 0 12px 0;">
                    📊 ÍNDICE DE ALERTAS
                    <span style="background: rgba(59, 130, 246, 0.2); padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">
                        ${total} total
                    </span>
                </h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    ${this.renderCategory('🚩 Red Flags', this.alertas.redFlags, this.config.colors.redFlags)}
                    ${this.renderCategory('⚠️ Sospechosos', this.alertas.suspicious, this.config.colors.suspicious)}
                    ${this.renderCategory('🔀 Contradicciones', this.alertas.contradictions, this.config.colors.contradictions)}
                    ${this.renderCategory('⏸️ Micro-pausas', this.alertas.microPausas, this.config.colors.microPausas)}
                </div>
            </div>
        `;
    }

    /**
     * Renderizar categoría individual
     */
    renderCategory(label, count, color) {
        return `
            <div class="alerta-category">
                <span style="color: #e0e0e0; font-size: 13px;">${label}</span>
                <span class="alerta-badge" style="background: ${color}20; color: ${color};">
                    ${count}
                </span>
            </div>
        `;
    }

    /**
     * Update method (not used)
     */
    update(data) {
        // Este componente no se actualiza durante simulación
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlertasIndexComponent;
}
