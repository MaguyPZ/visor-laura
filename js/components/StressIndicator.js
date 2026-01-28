/**
 * StressIndicator - Indicador de estrés vocal
 * 
 * Muestra nivel de estrés con barra de color y etiqueta
 */
class StressIndicator extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'StressIndicator',
            debug: true,
            colors: {
                low: '#22c55e',    // Verde
                medium: '#eab308', // Amarillo
                high: '#ef4444'    // Rojo
            },
            thresholds: {
                medium: 0.3,
                high: 0.7
            }
        });
    }

    /**
     * Validar datos de estrés
     */
    validate(data) {
        if (!super.validate(data)) return false;

        if (typeof data.stress !== 'number') {
            this.log('Invalid stress value', 'warn');
            return false;
        }

        if (data.stress < 0 || data.stress > 1) {
            this.log(`Stress out of range: ${data.stress}`, 'warn');
            return false;
        }

        return true;
    }

    /**
     * Renderizar indicador de estrés
     */
    render(data) {
        const { stress } = data;

        // Obtener color y etiqueta
        const color = this.getColor(stress);
        const label = this.getLabel(stress);
        const percent = Math.round(stress * 100);

        // Renderizar HTML
        this.element.innerHTML = `
            <div class="indicator-compact">
                <h3>📊 ESTRÉS</h3>
                <div class="bar-container">
                    <div class="bar-fill" 
                         style="width: ${percent}%; background: ${color};">
                    </div>
                </div>
                <div class="indicator-label">
                    <span style="color: ${color};">${label}</span>
                    <span style="color: #666;">${percent}%</span>
                </div>
            </div>
        `;

        this.log(`Updated: ${label} (${percent}%)`);
    }

    /**
     * Obtener color según nivel de estrés
     */
    getColor(stress) {
        if (stress < this.config.thresholds.medium) {
            return this.config.colors.low;
        } else if (stress < this.config.thresholds.high) {
            return this.config.colors.medium;
        } else {
            return this.config.colors.high;
        }
    }

    /**
     * Obtener etiqueta según nivel de estrés
     */
    getLabel(stress) {
        if (stress < this.config.thresholds.medium) {
            return 'BAJO';
        } else if (stress < this.config.thresholds.high) {
            return 'MODERADO';
        } else {
            return 'ALTO';
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StressIndicator;
}
