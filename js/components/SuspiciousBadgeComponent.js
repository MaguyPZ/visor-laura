/**
 * SuspiciousBadgeComponent - Badge overlay para momentos sospechosos
 * 
 * Muestra momentos de importancia MEDIA durante la simulación
 * Aparece/desaparece con transiciones CSS suaves
 */
class SuspiciousBadgeComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'SuspiciousBadgeComponent',
            debug: true,
            colors: {
                suspicious: '#f97316'  // Naranja
            }
        });

        this.currentMoment = null;
        this.isVisible = false;
    }

    /**
     * Validar datos del momento sospechoso
     */
    validate(data) {
        if (!super.validate(data)) return false;

        if (!data.moment) {
            this.log('No moment data provided', 'warn');
            return false;
        }

        return true;
    }

    /**
     * Mostrar badge con momento sospechoso
     */
    show(moment) {
        if (!this.validate({ moment })) return;

        this.currentMoment = moment;
        this.isVisible = true;
        this.render();

        this.log(`Showing suspicious moment: ${moment.tipo || 'SOSPECHOSO'}`, 'info');
    }

    /**
     * Ocultar badge
     */
    hide() {
        this.isVisible = false;
        const badge = this.element.querySelector('.suspicious-badge');
        if (badge) {
            badge.classList.remove('visible');
        }

        this.log('Hiding suspicious badge', 'info');
    }

    /**
     * Renderizar badge
     */
    render() {
        if (!this.currentMoment) return;

        const moment = this.currentMoment;
        const tipo = moment.tipo || 'MOMENTO SOSPECHOSO';
        const analisis = moment.analisis_integrado || moment.descripcion || 'Momento sospechoso detectado';

        this.element.innerHTML = `
            <div class="suspicious-badge ${this.isVisible ? 'visible' : ''}">
                <div class="suspicious-header">
                    <span class="suspicious-icon">⚠️</span>
                    <span class="suspicious-title">${tipo}</span>
                </div>
                <div class="suspicious-text">
                    ${analisis}
                </div>
            </div>
        `;

        this.log('Rendered suspicious badge', 'success');
    }

    /**
     * Actualizar durante simulación
     */
    update(data) {
        // Este componente se controla manualmente con show/hide
        // basado en detección de momentos sospechosos
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuspiciousBadgeComponent;
}
