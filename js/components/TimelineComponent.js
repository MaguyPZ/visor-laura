/**
 * TimelineComponent - Componente de línea de tiempo
 * 
 * Muestra segmentos de audio y permite navegación
 */
class TimelineComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'TimelineComponent',
            debug: true,
            colors: {
                segment: '#3b82f6',
                active: '#22c55e',
                critical: '#ef4444'
            }
        });

        this.segments = [];
        this.currentSegment = null;
    }

    /**
     * Validar datos de timeline
     */
    validate(data) {
        if (!super.validate(data)) return false;

        if (!Array.isArray(data.segments)) {
            this.log('No segments array provided', 'warn');
            return false;
        }

        return true;
    }

    /**
     * Cargar segmentos del timeline
     */
    loadSegments(segments) {
        this.segments = segments;
        this.renderTimeline();
    }

    /**
     * Renderizar timeline completo
     */
    renderTimeline() {
        if (this.segments.length === 0) {
            this.element.innerHTML = '<p style="color: #666;">No hay segmentos</p>';
            return;
        }

        const html = `
            <div class="timeline-container">
                <h3 style="margin-bottom: 10px; color: #94a3b8; font-size: 12px;">
                    ⏱️ LÍNEA DE TIEMPO (${this.segments.length} segmentos)
                </h3>
                <div class="timeline-segments">
                    ${this.segments.map((seg, i) => this.renderSegment(seg, i)).join('')}
                </div>
            </div>
        `;

        this.element.innerHTML = html;
        this.log(`Timeline rendered with ${this.segments.length} segments`);
    }

    /**
     * Renderizar un segmento individual
     */
    renderSegment(segment, index) {
        const duration = (segment.end - segment.start).toFixed(1);
        const speaker = segment.speaker || 'SPEAKER';
        const isActive = this.currentSegment === index;

        return `
            <div class="timeline-segment ${isActive ? 'active' : ''}" 
                 data-index="${index}"
                 style="
                     background: ${isActive ? this.config.colors.active : this.config.colors.segment};
                     padding: 8px;
                     margin-bottom: 4px;
                     border-radius: 4px;
                     cursor: pointer;
                     transition: all 0.3s;
                 "
                 onmouseover="this.style.opacity='0.8'"
                 onmouseout="this.style.opacity='1'">
                <div style="display: flex; justify-content: space-between; font-size: 11px;">
                    <span style="color: white; font-weight: bold;">
                        ${this.formatTime(segment.start)} - ${this.formatTime(segment.end)}
                    </span>
                    <span style="color: rgba(255,255,255,0.8);">
                        ${duration}s | ${speaker}
                    </span>
                </div>
                ${segment.transcripcion ? `
                    <div style="color: rgba(255,255,255,0.9); font-size: 10px; margin-top: 4px; line-height: 1.3;">
                        ${this.truncate(segment.transcripcion, 80)}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Actualizar segmento activo
     */
    render(data) {
        const { currentTime } = data;

        // Encontrar segmento actual
        const activeIndex = this.segments.findIndex(seg =>
            currentTime >= seg.start && currentTime <= seg.end
        );

        if (activeIndex !== this.currentSegment) {
            this.currentSegment = activeIndex;
            this.renderTimeline();
            this.log(`Active segment: ${activeIndex}`);
        }
    }

    /**
     * Formatear tiempo en MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Truncar texto
     */
    truncate(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimelineComponent;
}
