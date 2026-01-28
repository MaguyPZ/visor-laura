/**
 * SpeakerIndicatorComponent - Indicador de speaker activo
 * 
 * Muestra qué speaker está hablando en el momento actual
 * Con dot animado y nombre del speaker
 */
class SpeakerIndicatorComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'SpeakerIndicatorComponent',
            debug: false,
            colors: {
                speaker00: '#3b82f6',  // Azul
                speaker01: '#22c55e',  // Verde
                speaker02: '#f97316',  // Naranja
                speaker03: '#a855f7'   // Púrpura
            }
        });

        this.currentSpeaker = 'SPEAKER_00';
        this.render();
    }

    /**
     * Actualizar speaker activo
     */
    update(data) {
        if (!data || !data.speaker) return;

        if (this.currentSpeaker !== data.speaker) {
            this.currentSpeaker = data.speaker;
            this.render();
        }
    }

    /**
     * Renderizar indicador
     */
    render() {
        const speakerNum = this.currentSpeaker.replace('SPEAKER_', '').replace('_', '');
        const colorKey = `speaker0${speakerNum}`;
        const color = this.config.colors[colorKey] || this.config.colors.speaker00;

        const displayName = this.currentSpeaker.replace('_', ' ');

        this.element.innerHTML = `
            <div class="speaker-indicator">
                <div class="speaker-dot" style="background: ${color};"></div>
                <span style="color: ${color}; font-weight: bold; font-size: 13px;">
                    ${displayName}
                </span>
            </div>
        `;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpeakerIndicatorComponent;
}
