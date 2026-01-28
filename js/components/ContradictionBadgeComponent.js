/**
 * ContradictionBadgeComponent - Badge overlay para contradicciones
 * 
 * Muestra contradicciones detectadas durante reproducción
 * Con las 2 declaraciones contradictorias lado a lado
 */
class ContradictionBadgeComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'ContradictionBadgeComponent',
            debug: true,
            colors: {
                contradiction: '#a855f7'  // Púrpura
            }
        });

        this.currentContradiction = null;
        this.isVisible = false;
    }

    /**
     * Validar datos de contradicción
     */
    validate(data) {
        if (!super.validate(data)) return false;

        if (!data.contradiction) {
            this.log('No contradiction data provided', 'warn');
            return false;
        }

        return true;
    }

    /**
     * Mostrar badge con contradicción
     */
    show(contradiction) {
        if (!this.validate({ contradiction })) return;

        this.currentContradiction = contradiction;
        this.isVisible = true;
        this.render();

        this.log(`Showing contradiction: ${contradiction.tipo || 'CONTRADICCIÓN'}`, 'info');
    }

    /**
     * Ocultar badge
     */
    hide() {
        this.isVisible = false;
        const badge = this.element.querySelector('.contradiction-badge');
        if (badge) {
            badge.classList.remove('visible');
        }

        this.log('Hiding contradiction badge', 'info');
    }

    /**
     * Renderizar badge
     */
    render() {
        if (!this.currentContradiction) return;

        const c = this.currentContradiction;
        const tipo = c.tipo || 'CONTRADICCIÓN';
        const explicacion = c.explicacion || c.descripcion || 'Contradicción detectada';
        const cite1 = c.cita_1 || c.text_1 || 'Primera declaración';
        const cite2 = c.cita_2 || c.text_2 || 'Segunda declaración';
        const time1 = this.formatTime(c.timestamp_1 || 0);
        const time2 = this.formatTime(c.timestamp_2 || 0);

        this.element.innerHTML = `
            <div class="contradiction-badge ${this.isVisible ? 'visible' : ''}">
                <div class="contradiction-header">
                    <span class="contradiction-icon">🔀</span>
                    <span class="contradiction-title">${tipo}</span>
                </div>
                <div class="contradiction-body">
                    <div class="contradiction-explanation">${explicacion}</div>
                    <div class="contradiction-citations">
                        <div class="contradiction-cite">
                            <span class="contradiction-time">${time1}</span>
                            "${cite1}"
                        </div>
                        <div class="contradiction-vs">VS</div>
                        <div class="contradiction-cite">
                            <span class="contradiction-time">${time2}</span>
                            "${cite2}"
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.log('Rendered contradiction badge', 'success');
    }

    /**
     * Formatear tiempo
     */
    formatTime(seconds) {
        if (typeof seconds !== 'number') return seconds;
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
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
    module.exports = ContradictionBadgeComponent;
}
