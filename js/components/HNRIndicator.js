/**
 * HNRIndicator - Indicador de Harmonic-to-Noise Ratio
 * 
 * Muestra calidad de voz
 */
class HNRIndicator extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'HNRIndicator',
            debug: true,
            colors: {
                good: '#22c55e',    // Verde (>10 dB)
                medium: '#eab308',  // Amarillo (5-10 dB)
                poor: '#ef4444'     // Rojo (<5 dB)
            },
            thresholds: {
                good: 10,
                medium: 5
            }
        });
    }

    /**
     * Validar datos de HNR
     */
    validate(data) {
        if (!super.validate(data)) return false;

        if (typeof data.hnr !== 'number') {
            this.log('Invalid HNR value', 'warn');
            return false;
        }

        return true;
    }

    /**
     * Renderizar indicador HNR
     */
    render(data) {
        const { hnr } = data;

        // Obtener color y etiqueta
        const color = this.getColor(hnr);
        const label = this.getLabel(hnr);
        const value = hnr.toFixed(1);

        // Calcular porcentaje (normalizar HNR de 0-20 dB a 0-100%)
        const percent = Math.min(100, Math.max(0, (hnr / 20) * 100));

        // Renderizar HTML
        this.element.innerHTML = `
            <div class="indicator-compact">
                <h3>🎤 CALIDAD VOZ (HNR)</h3>
                <div class="bar-container">
                    <div class="bar-fill" 
                         style="width: ${percent}%; background: ${color};">
                    </div>
                </div>
                <div class="indicator-label">
                    <span style="color: ${color};">${label}</span>
                    <span style="color: #666;">${value} dB</span>
                </div>
            </div>
        `;

        this.log(`Updated: ${label} (${value} dB)`);
    }

    /**
     * Obtener color según HNR
     */
    getColor(hnr) {
        if (hnr >= this.config.thresholds.good) {
            return this.config.colors.good;
        } else if (hnr >= this.config.thresholds.medium) {
            return this.config.colors.medium;
        } else {
            return this.config.colors.poor;
        }
    }

    /**
     * Obtener etiqueta según HNR
     */
    getLabel(hnr) {
        if (hnr >= this.config.thresholds.good) {
            return 'BUENA';
        } else if (hnr >= this.config.thresholds.medium) {
            return 'REGULAR';
        } else {
            return 'POBRE';
        }
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HNRIndicator;
}
