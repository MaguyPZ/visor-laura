/**
 * TimelineMarkersComponent - Marcadores visuales en timeline
 * 
 * Muestra marcadores verticales para eventos importantes:
 * - Red flags (ALTA)
 * - Momentos sospechosos (MEDIA)
 * - Micro-pausas
 */
class TimelineMarkersComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'TimelineMarkersComponent',
            debug: true,
            colors: {
                redFlag: '#ef4444',
                suspicious: '#f97316',
                micropause: '#eab308'
            }
        });

        this.markers = [];
        this.duration = 0;
    }

    /**
     * Cargar marcadores
     */
    loadMarkers(data) {
        if (!data) {
            this.log('No data provided', 'warn');
            return;
        }

        this.markers = [];
        this.duration = data.duration || 100;

        // Agregar red flags (ALTA) - usar nivel_importancia o importancia
        if (data.momentos_criticos) {
            data.momentos_criticos
                .filter(m => {
                    const nivel = m.nivel_importancia || m.importancia;
                    return nivel === 'ALTA' || nivel === 'ALTO';
                })
                .forEach(m => {
                    this.markers.push({
                        time: m.segundos_inicio || m.segundo_inicio || 0,
                        type: 'redFlag',
                        label: m.tipo_indicador || m.tipo || 'Red Flag',
                        description: m.analisis_integrado || m.descripcion || ''
                    });
                });
        }

        // Agregar suspicious (MEDIA) - usar nivel_importancia o importancia
        if (data.momentos_criticos) {
            data.momentos_criticos
                .filter(m => {
                    const nivel = m.nivel_importancia || m.importancia;
                    return nivel === 'MEDIA' || nivel === 'MEDIO';
                })
                .forEach(m => {
                    this.markers.push({
                        time: m.segundos_inicio || m.segundo_inicio || 0,
                        type: 'suspicious',
                        label: m.tipo_indicador || m.tipo || 'Sospechoso',
                        description: m.analisis_integrado || m.descripcion || ''
                    });
                });
        }

        // Agregar micro-pausas (solo si existen)
        if (data.micro_pausas && data.micro_pausas.pausas_sospechosas) {
            data.micro_pausas.pausas_sospechosas
                .filter(p => p.nivel_sospecha === 'ALTO' || p.nivel_sospecha === 'MEDIO')
                .forEach(p => {
                    this.markers.push({
                        time: p.inicio_s || 0,
                        type: 'micropause',
                        label: `Pausa ${p.nivel_sospecha}`,
                        description: `${p.gap_seconds?.toFixed(2)}s`
                    });
                });
        }

        this.render();
        this.log(`Loaded ${this.markers.length} markers (momentos: ${data.momentos_criticos?.length || 0}, pausas: ${data.micro_pausas?.pausas_sospechosas?.length || 0})`, 'success');
    }

    /**
     * Renderizar marcadores
     */
    render() {
        // Buscar el timeline-container (renderizado por TimelineComponent)
        const timelineContainer = document.querySelector('.timeline-container');

        if (!timelineContainer) {
            this.log('Timeline container not found, will retry', 'warn');
            // Reintentar después de que el timeline se renderice
            setTimeout(() => this.render(), 500);
            return;
        }

        if (this.markers.length === 0) {
            this.log('No markers to render', 'info');
            return;
        }

        // Crear container de marcadores si no existe
        let markersContainer = timelineContainer.querySelector('.timeline-markers-overlay');
        if (!markersContainer) {
            markersContainer = document.createElement('div');
            markersContainer.className = 'timeline-markers-overlay';
            markersContainer.style.cssText = 'position: absolute; top: 0; left: 0; width: 100%; pointer-events: none; z-index: 10; overflow: hidden;';
            timelineContainer.style.position = 'relative';
            timelineContainer.appendChild(markersContainer);
        }

        // Obtener altura del timeline para que las líneas no se salgan
        const timelineHeight = timelineContainer.offsetHeight;
        markersContainer.style.height = `${timelineHeight}px`;

        // Renderizar marcadores
        const markersHTML = this.markers.map((marker, i) => {
            const position = (marker.time / this.duration) * 100;
            const color = this.config.colors[marker.type] || '#888';

            return `
                <div class="timeline-marker ${marker.type}" 
                     style="left: ${position}%; background: ${color}; height: ${timelineHeight}px; pointer-events: all;"
                     title="${marker.label}: ${marker.description}">
                    <div class="marker-tooltip">
                        <strong>${marker.label}</strong><br>
                        ${this.formatTime(marker.time)}
                        ${marker.description ? `<br>${marker.description}` : ''}
                    </div>
                </div>
            `;
        }).join('');

        markersContainer.innerHTML = markersHTML;
        this.log(`Rendered ${this.markers.length} markers in timeline (height: ${timelineHeight}px)`, 'success');
    }

    /**
     * Formatear tiempo
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    /**
     * Update method (not used)
     */
    update(data) {
        // Este componente es estático después de cargar
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimelineMarkersComponent;
}
