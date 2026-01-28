/**
 * EmotionIndicator - Indicador de estado emocional
 * 
 * Muestra emoción detectada con icono y color
 */
class EmotionIndicator extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'EmotionIndicator',
            debug: true,
            emotions: {
                neutral: {
                    icon: '😌',
                    label: 'NEUTRAL',
                    color: '#3b82f6'  // Azul
                },
                tension: {
                    icon: '😰',
                    label: 'TENSIÓN',
                    color: '#f97316'  // Naranja
                }
            }
        });
    }

    /**
     * Validar datos de emoción
     */
    validate(data) {
        if (!super.validate(data)) return false;

        if (typeof data.emotion !== 'number') {
            this.log('Invalid emotion value', 'warn');
            return false;
        }

        return true;
    }

    /**
     * Renderizar indicador emocional
     */
    render(data) {
        const { emotion } = data;

        // Determinar emoción (0 = neutral, 1 = tensión)
        const emotionType = emotion === 0 ? 'neutral' : 'tension';
        const config = this.config.emotions[emotionType];

        // Renderizar HTML
        this.element.innerHTML = `
            <div class="indicator-compact">
                <h3>🎭 EMOCIÓN</h3>
                <div class="bar-container">
                    <div class="bar-fill" 
                         style="width: 100%; background: ${config.color};">
                    </div>
                </div>
                <div class="indicator-label">
                    <span style="color: ${config.color};">
                        ${config.icon} ${config.label}
                    </span>
                </div>
            </div>
        `;

        this.log(`Updated: ${config.label}`);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmotionIndicator;
}
