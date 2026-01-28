/**
 * BaseIndicator - Clase base para todos los indicadores
 * 
 * Principios:
 * - Cada indicador es independiente
 * - Falla uno ≠ fallan todos
 * - Error handling automático
 * - Logging incorporado
 */
class BaseIndicator {
    constructor(config) {
        this.config = {
            elementId: config.elementId,
            name: config.name || 'Indicator',
            debug: config.debug || false,
            ...config
        };

        this.element = null;
        this.lastValue = null;
        this.errorCount = 0;

        this.init();
    }

    /**
     * Inicializar el indicador
     */
    init() {
        try {
            this.element = document.getElementById(this.config.elementId);

            if (!this.element) {
                throw new Error(`Element #${this.config.elementId} not found`);
            }

            this.log('Initialized successfully');
        } catch (error) {
            this.handleError('init', error);
        }
    }

    /**
     * Actualizar el indicador con nuevos datos
     * Template method - override en subclases
     */
    update(data) {
        try {
            // Validar datos
            if (!this.validate(data)) {
                return;
            }

            // Renderizar (implementado en subclases)
            this.render(data);

            // Guardar último valor
            this.lastValue = data;

            // Reset error count en éxito
            this.errorCount = 0;

        } catch (error) {
            this.handleError('update', error);
        }
    }

    /**
     * Validar datos de entrada
     * Override en subclases para validación específica
     */
    validate(data) {
        if (data === null || data === undefined) {
            this.log('No data provided', 'warn');
            return false;
        }
        return true;
    }

    /**
     * Renderizar el indicador
     * DEBE ser implementado en subclases
     */
    render(data) {
        throw new Error('render() must be implemented in subclass');
    }

    /**
     * Manejo de errores
     */
    handleError(method, error) {
        this.errorCount++;

        console.error(`[${this.config.name}] Error in ${method}:`, error);

        // Mostrar error en el UI
        if (this.element) {
            this.element.innerHTML = `
                <div style="color: #ef4444; font-size: 12px;">
                    ⚠️ Error (${this.errorCount})
                </div>
            `;
        }

        // Si hay muchos errores, dejar de intentar
        if (this.errorCount > 10) {
            console.error(`[${this.config.name}] Too many errors, stopping`);
        }
    }

    /**
     * Logging
     */
    log(message, level = 'info') {
        if (!this.config.debug) return;

        const prefix = `[${this.config.name}]`;

        switch (level) {
            case 'error':
                console.error(prefix, message);
                break;
            case 'warn':
                console.warn(prefix, message);
                break;
            default:
                console.log(prefix, message);
        }
    }

    /**
     * Reset del indicador
     */
    reset() {
        try {
            this.lastValue = null;
            this.errorCount = 0;

            if (this.element) {
                this.element.innerHTML = '';
            }

            this.log('Reset');
        } catch (error) {
            this.handleError('reset', error);
        }
    }
}

// Export para módulos ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseIndicator;
}
