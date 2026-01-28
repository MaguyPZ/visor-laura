/**
 * TimeDisplayComponent - Reloj digital del tiempo actual
 * 
 * Muestra el tiempo de reproducción en formato MM:SS
 * Siempre visible en top-right corner
 */
class TimeDisplayComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'TimeDisplayComponent',
            debug: false,  // Menos verbose
            colors: {
                primary: '#3b82f6'  // Azul
            }
        });

        this.currentTime = 0;
        this.render();
    }

    /**
     * Validar datos de tiempo
     */
    validate(data) {
        if (!super.validate(data)) return false;

        if (typeof data.time !== 'number') {
            this.log('Invalid time value', 'warn');
            return false;
        }

        return true;
    }

    /**
     * Actualizar tiempo
     */
    update(data) {
        if (!this.validate(data)) return;

        this.currentTime = data.time;
        this.render();
    }

    /**
     * Renderizar reloj
     */
    render() {
        const timeStr = this.formatTime(this.currentTime);

        this.element.innerHTML = `
            <div class="time-display">
                ${timeStr}
            </div>
        `;
    }

    /**
     * Formatear tiempo en MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimeDisplayComponent;
}
