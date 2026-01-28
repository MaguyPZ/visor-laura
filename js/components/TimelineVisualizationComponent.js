/**
 * TimelineVisualizationComponent
 * Renderiza la línea de tiempo como un mapa de calor interactivo.
 * Reemplaza la lista de texto simple.
 */
class TimelineVisualizationComponent extends BaseIndicator {
    constructor(containerId) {
        super({
            elementId: containerId,
            name: 'TimelineVisualizationComponent',
            debug: false
        });
        this.data = null;
        this.duration = 0;
    }

    /**
     * Carga los datos de la timeline
     * @param {Array} timelineData - Array de segmentos del JSON
     * @param {Number} totalDuration - Duración total del video en segundos
     */
    loadData(timelineData, totalDuration) {
        this.data = timelineData || [];
        // Si no viene la duración total, usamos el final del último segmento
        this.duration = totalDuration || (this.data.length > 0 ? this.data[this.data.length - 1].end : 0);

        this.render();
    }

    render() {
        if (!this.data || this.data.length === 0) {
            this.container.innerHTML = '<div class="no-data">Esperando datos de timeline...</div>';
            return;
        }

        // Crear contenedor principal de la visualización
        const html = `
            <div class="timeline-visual-container">
                <div class="timeline-header">
                    <h3>📊 Mapa de Calor Emocional</h3>
                    <div class="timeline-legend">
                        <span class="legend-item"><span class="dot normal"></span> Normal</span>
                        <span class="legend-item"><span class="dot warning"></span> Tensión</span>
                        <span class="legend-item"><span class="dot critical"></span> Crítico</span>
                    </div>
                </div>
                
                <div class="timeline-track-wrapper">
                    <!-- Marcadores de tiempo -->
                    <div class="time-markers">
                        <span>0:00</span>
                        <span>${this.formatTime(this.duration / 2)}</span>
                        <span>${this.formatTime(this.duration)}</span>
                    </div>

                    <!-- Pista (Track) -->
                    <div class="timeline-track" id="timelineTrack">
                        ${this.data.map((seg, index) => this.createSegmentHTML(seg, index)).join('')}
                        <!-- Indicador de progreso (cabezal) -->
                        <div class="playhead" id="timelinePlayhead"></div>
                    </div>
                </div>

                <!-- Contenedor para Tooltip Flotante -->
                <div id="timelineTooltip" class="timeline-tooltip"></div>
            </div>
        `;

        this.element.innerHTML = html;
        this.attachEvents();
    }

    createSegmentHTML(segment, index) {
        // Calcular ancho y posición en %
        const startPct = (segment.start / this.duration) * 100;
        const widthPct = ((segment.end - segment.start) / this.duration) * 100;

        // Determinar color basado en métricas
        const riskLevel = this.calculateRiskLevel(segment);
        const className = `timeline-segment ${riskLevel}`;

        // Iconos si aplica
        let icons = '';
        if (segment.speaker !== 'SPEAKER_00') icons += '👤'; // Cambio de speaker

        // Tooltip data attributes
        const tooltipData = JSON.stringify({
            time: `${this.formatTime(segment.start)} - ${this.formatTime(segment.end)}`,
            speaker: segment.speaker,
            text: segment.transcripcion ? segment.transcripcion.substring(0, 60) + '...' : '',
            jitter: segment.metricas_acusticas?.jitter_percent?.toFixed(2) || 'N/A',
            shimmer: segment.metricas_acusticas?.shimmer_percent?.toFixed(2) || 'N/A',
            risk: riskLevel
        }).replace(/"/g, '&quot;');

        return `
            <div class="${className}" 
                 style="left: ${startPct}%; width: ${widthPct}%;"
                 data-index="${index}"
                 data-start="${segment.start}"
                 data-tooltip="${tooltipData}"
                 onclick="window.timelineVisual.jumpTo(${segment.start})">
                 <span class="segment-icon">${icons}</span>
            </div>
        `;
    }

    calculateRiskLevel(segment) {
        if (!segment.metricas_acusticas) return 'normal';

        const { jitter_percent, shimmer_percent } = segment.metricas_acusticas;

        // Criterios arbitrarios basados en análisis forense (ajustar según necesidad)
        if (jitter_percent > 2.5 || shimmer_percent > 15) return 'critical';
        if (jitter_percent > 2.0 || shimmer_percent > 12) return 'warning';
        return 'normal';
    }

    attachEvents() {
        const segments = this.element.querySelectorAll('.timeline-segment');
        const tooltip = this.element.querySelector('#timelineTooltip');

        segments.forEach(seg => {
            seg.addEventListener('mouseenter', (e) => {
                const data = JSON.parse(e.target.dataset.tooltip.replace(/&quot;/g, '"'));
                this.showTooltip(tooltip, data, e);
            });

            seg.addEventListener('mousemove', (e) => {
                this.positionTooltip(tooltip, e);
            });

            seg.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    }

    showTooltip(tooltip, data, e) {
        tooltip.innerHTML = `
            <div class="tooltip-header ${data.risk}">
                <strong>${data.time}</strong> | ${data.speaker}
            </div>
            <div class="tooltip-body">
                <p>"${data.text}"</p>
                <div class="tooltip-metrics">
                    <span class="${this.getMetricClass(data.jitter, 2)}">Jitter: ${data.jitter}%</span>
                    <span class="${this.getMetricClass(data.shimmer, 12)}">Shimmer: ${data.shimmer}%</span>
                </div>
            </div>
        `;
        tooltip.style.opacity = '1';
        this.positionTooltip(tooltip, e);
    }

    positionTooltip(tooltip, e) {
        // Posicionar cerca del mouse pero sin salirse
        const rect = this.element.getBoundingClientRect();
        let left = e.clientX - rect.left + 15;
        let top = e.clientY - rect.top + 15;

        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    getMetricClass(val, threshold) {
        return parseFloat(val) > threshold ? 'metric-alert' : 'metric-normal';
    }

    jumpTo(seconds) {
        const video = document.getElementById('mainVideo');
        if (video) {
            video.currentTime = seconds;
            video.play();
        }
    }

    update(data) {
        // Mover cabezal de reproducción
        if (data && data.currentTime !== undefined && this.duration > 0) {
            const pct = (data.currentTime / this.duration) * 100;
            const playhead = this.element.querySelector('#timelinePlayhead');
            if (playhead) {
                playhead.style.left = `${pct}%`;
            }

            // Resaltar segmento activo? (Opcional, ya tenemos cabezal)
        }
    }

    formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
}
