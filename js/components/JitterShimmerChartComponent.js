/**
 * JitterShimmerChartComponent - Gráfico de inestabilidad vocal (v2.1)
 * 
 * MEJORAS v2.0:
 * A) Escala Adaptativa: El eje Y se ajusta al rango real de los datos
 * B) Desviación del Baseline: Muestra cuánto se desvía del promedio personal
 * C) Gradiente de Color: La línea cambia de color según el nivel de riesgo
 * 
 * v2.1: Jitter y Shimmer ahora usan datos REALES del pipeline Python.
 *       Los data_points incluyen campos 'jitter' y 'shimmer' con valores de Praat.
 * 
 * ROLLBACK: Copiar JitterShimmerChartComponent.BACKUP.js sobre este archivo
 */
class JitterShimmerChartComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'JitterShimmerChartComponent',
            debug: true
        });

        this.dataPoints = [];
        this.criticalMoments = [];
        this.canvas = null;
        this.ctx = null;
        this.currentTime = 0;

        // v2.0: Estadísticas calculadas
        this.stats = {
            jitter: { min: 0, max: 0, avg: 0, stdDev: 0 },
            shimmer: { min: 0, max: 0, avg: 0, stdDev: 0 }
        };
    }

    /**
     * Cargar datos
     */
    loadData(dataPoints, criticalMoments = []) {
        this.dataPoints = dataPoints;
        this.criticalMoments = criticalMoments;

        // v2.0: Calcular estadísticas para escala adaptativa y baseline
        this.calculateStats();

        setTimeout(() => {
            try {
                this.createChart();
            } catch (error) {
                this.handleError('loadData', error);
            }
        }, 200);

        this.log(`Loaded ${dataPoints.length} data points for jitter/shimmer chart`);
    }

    /**
     * v2.0: Calcular estadísticas de los datos
     */
    calculateStats() {
        if (this.dataPoints.length === 0) return;

        // v2.1: Usar datos reales de jitter y shimmer (sin estimación)
        const jitterValues = this.dataPoints.map(p => p.jitter || p.p || 0);
        const shimmerValues = this.dataPoints.map(p => p.shimmer || 0);  // Sin fallback a estimación

        // Jitter stats
        this.stats.jitter.min = Math.min(...jitterValues);
        this.stats.jitter.max = Math.max(...jitterValues);
        this.stats.jitter.avg = jitterValues.reduce((a, b) => a + b, 0) / jitterValues.length;
        this.stats.jitter.stdDev = this.calcStdDev(jitterValues, this.stats.jitter.avg);

        // Shimmer stats
        this.stats.shimmer.min = Math.min(...shimmerValues);
        this.stats.shimmer.max = Math.max(...shimmerValues);
        this.stats.shimmer.avg = shimmerValues.reduce((a, b) => a + b, 0) / shimmerValues.length;
        this.stats.shimmer.stdDev = this.calcStdDev(shimmerValues, this.stats.shimmer.avg);

        this.log(`Stats: Jitter avg=${this.stats.jitter.avg.toFixed(2)}%, Shimmer avg=${this.stats.shimmer.avg.toFixed(2)}%`);
    }

    calcStdDev(values, avg) {
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
    }

    /**
     * Crear canvas y renderizar
     */
    createChart() {
        if (!this.element) {
            this.log('Element not found', 'warn');
            return;
        }

        const width = Math.max(this.element.offsetWidth, 600);
        const height = 280; // Un poco más alto para nueva info

        // v2.0: Calcular escala adaptativa
        const maxDataValue = Math.max(this.stats.jitter.max, this.stats.shimmer.max);
        const yAxisMax = Math.ceil(maxDataValue * 1.3); // 30% headroom
        const yAxisDisplay = Math.max(yAxisMax, 1); // Mínimo 1% para no aplastar

        // v2.0: Calcular % de variación respecto al baseline
        const jitterDeviation = ((this.stats.jitter.max - this.stats.jitter.avg) / this.stats.jitter.avg * 100) || 0;
        const shimmerDeviation = ((this.stats.shimmer.max - this.stats.shimmer.avg) / this.stats.shimmer.avg * 100) || 0;

        this.element.innerHTML = `
            <div style="background: rgba(30, 30, 45, 0.8); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 16px;">
                <!-- Header con descripción MEJORADA -->
                <div style="margin-bottom: 12px;">
                    <h3 style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold; margin-bottom: 8px;">
                        📊 INESTABILIDAD VOCAL (Jitter / Shimmer) - v2.0
                    </h3>
                    
                    <!-- v2.0: Panel de Resumen Rápido (Deviation from Baseline) -->
                    <div style="display: flex; gap: 12px; margin-bottom: 12px;">
                        <div style="flex: 1; background: rgba(96, 165, 250, 0.1); border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 8px; padding: 10px; text-align: center;">
                            <div style="color: #60a5fa; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">Jitter (Promedio)</div>
                            <div style="color: #fff; font-size: 20px; font-weight: bold;">${this.stats.jitter.avg.toFixed(2)}%</div>
                            <div style="color: ${jitterDeviation > 50 ? '#ef4444' : jitterDeviation > 20 ? '#eab308' : '#22c55e'}; font-size: 11px;">
                                ${jitterDeviation > 0 ? '↑' : '↓'} Pico: +${jitterDeviation.toFixed(0)}% vs promedio
                            </div>
                        </div>
                        <div style="flex: 1; background: rgba(248, 113, 113, 0.1); border: 1px solid rgba(248, 113, 113, 0.3); border-radius: 8px; padding: 10px; text-align: center;">
                            <div style="color: #f87171; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">Shimmer (Promedio)</div>
                            <div style="color: #fff; font-size: 20px; font-weight: bold;">${this.stats.shimmer.avg.toFixed(2)}%</div>
                            <div style="color: ${shimmerDeviation > 50 ? '#ef4444' : shimmerDeviation > 20 ? '#eab308' : '#22c55e'}; font-size: 11px;">
                                ${shimmerDeviation > 0 ? '↑' : '↓'} Pico: +${shimmerDeviation.toFixed(0)}% vs promedio
                            </div>
                        </div>
                    </div>

                    <div style="background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; padding: 8px 10px; border-radius: 6px; margin-bottom: 12px;">
                        <div style="color: rgba(255,255,255,0.9); font-size: 10px; line-height: 1.5;">
                            <strong style="color: #22c55e;">📌 Interpretación:</strong>
                            Desviaciones <b>&gt;20%</b> del promedio = Posible estrés ⚠️ |
                            Desviaciones <b>&gt;50%</b> = Estrés significativo 🔴
                        </div>
                    </div>
                </div>
                
                <canvas id="jitterShimmerCanvas" width="${width}" height="${height}"></canvas>
                
                <!-- Leyenda -->
                <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; color: #94a3b8;">
                    <div style="display: flex; gap: 20px;">
                        <div>
                            <span style="display: inline-block; width: 16px; height: 3px; background: #60a5fa; margin-right: 4px;"></span>
                            Jitter
                        </div>
                        <div>
                            <span style="display: inline-block; width: 16px; height: 3px; background: #f87171; margin-right: 4px;"></span>
                            Shimmer
                        </div>
                        <div>
                            <span style="display: inline-block; width: 16px; height: 1px; background: #94a3b8; border-top: 1px dashed #94a3b8; margin-right: 4px;"></span>
                            Promedio (baseline)
                        </div>
                    </div>
                    <div style="font-size: 10px; color: #64748b;">
                        Escala adaptativa: 0-${yAxisDisplay.toFixed(1)}%
                    </div>
                </div>
            </div>
        `;

        setTimeout(() => {
            this.canvas = document.getElementById('jitterShimmerCanvas');
            if (!this.canvas) {
                this.log('Canvas not found', 'error');
                return;
            }

            this.ctx = this.canvas.getContext('2d');
            this.yAxisMax = yAxisDisplay; // Guardar para renderChart
            this.renderChart();
            this.log('Chart rendered successfully (v2.0)');
        }, 50);
    }

    /**
     * Renderizar gráfico (v2.0 con mejoras)
     */
    renderChart() {
        if (!this.ctx || this.dataPoints.length === 0) {
            this.log('Cannot render: no context or no data', 'warn');
            return;
        }

        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 50;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // v2.0: Usar escala adaptativa
        const yMax = this.yAxisMax || 5;

        // Limpiar
        this.ctx.clearRect(0, 0, width, height);

        // Background
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
        this.ctx.fillRect(0, 0, width, height);

        // Grid horizontal (adaptativo)
        this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        this.ctx.lineWidth = 1;
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (chartHeight * i / gridLines);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(width - padding, y);
            this.ctx.stroke();
        }

        // Labels Y-axis (adaptativo)
        this.ctx.fillStyle = '#64748B';
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'right';
        for (let i = 0; i <= gridLines; i++) {
            const value = ((gridLines - i) / gridLines) * yMax;
            const y = padding + (chartHeight * i / gridLines);
            this.ctx.fillText(`${value.toFixed(1)}%`, padding - 10, y + 4);
        }

        // v2.0: Dibujar líneas de baseline (promedio)
        this.drawBaselineLine(this.stats.jitter.avg, '#60a5fa', padding, chartWidth, chartHeight, height, yMax);
        this.drawBaselineLine(this.stats.shimmer.avg, '#f87171', padding, chartWidth, chartHeight, height, yMax);

        // Marcadores de momentos críticos
        this.criticalMoments.forEach(moment => {
            const x = padding + (moment.segundos_inicio / this.getMaxTime()) * chartWidth;

            this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding);
            this.ctx.lineTo(x, height - padding);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        });

        // v2.0: Áreas de fondo por nivel (relativas al baseline)
        this.drawLevelAreas(padding, chartWidth, chartHeight, height, yMax);

        // v2.1: Línea de Jitter - usa valor real
        const jitterData = this.dataPoints.map(p => ({
            t: p.t,
            v: p.jitter || p.p || 0  // Prioriza jitter real
        }));
        this.drawGradientLine(jitterData, this.stats.jitter.avg, '#60a5fa', padding, chartWidth, chartHeight, height, yMax);

        // v2.1: Línea de Shimmer - usa valor real (sin fallback a estimación)
        const shimmerData = this.dataPoints.map(p => ({
            t: p.t,
            v: p.shimmer || 0  // Usa shimmer real, no estima
        }));
        this.drawGradientLine(shimmerData, this.stats.shimmer.avg, '#f87171', padding, chartWidth, chartHeight, height, yMax);

        // Indicador de tiempo actual
        if (this.currentTime > 0) {
            const x = padding + (this.currentTime / this.getMaxTime()) * chartWidth;

            this.ctx.strokeStyle = '#22c55e';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding);
            this.ctx.lineTo(x, height - padding);
            this.ctx.stroke();
        }
    }

    /**
     * v2.0: Dibujar línea de baseline (promedio)
     */
    drawBaselineLine(avgValue, color, padding, chartWidth, chartHeight, height, yMax) {
        const y = height - padding - ((avgValue / yMax) * chartHeight);

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([4, 4]);
        this.ctx.globalAlpha = 0.5;
        this.ctx.beginPath();
        this.ctx.moveTo(padding, y);
        this.ctx.lineTo(padding + chartWidth, y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.globalAlpha = 1;
    }

    /**
     * v2.0: Dibujar áreas de nivel (relativas al eje adaptativo)
     */
    drawLevelAreas(padding, chartWidth, chartHeight, height, yMax) {
        // Calcular umbrales relativos al promedio más alto
        const avgMax = Math.max(this.stats.jitter.avg, this.stats.shimmer.avg);
        const highThreshold = avgMax * 1.5; // 50% sobre promedio = Alto
        const medThreshold = avgMax * 1.2;  // 20% sobre promedio = Medio

        // Área ALTA (rojo) - por encima del umbral alto
        const highY = height - padding - ((Math.min(highThreshold, yMax) / yMax) * chartHeight);
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        this.ctx.fillRect(padding, padding, chartWidth, highY - padding);

        // Área MEDIA (amarillo)
        const medY = height - padding - ((Math.min(medThreshold, yMax) / yMax) * chartHeight);
        this.ctx.fillStyle = 'rgba(234, 179, 8, 0.1)';
        this.ctx.fillRect(padding, highY, chartWidth, medY - highY);

        // Área BAJA (verde) - por debajo del umbral medio
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
        this.ctx.fillRect(padding, medY, chartWidth, (height - padding) - medY);
    }

    /**
     * v2.0: Dibujar línea con gradiente de color según desviación del baseline
     */
    drawGradientLine(data, avgBaseline, baseColor, padding, chartWidth, chartHeight, height, yMax) {
        if (data.length < 2) return;

        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        // Dibujar segmento por segmento con color variable
        for (let i = 0; i < data.length - 1; i++) {
            const point = data[i];
            const nextPoint = data[i + 1];

            const x1 = padding + (point.t / this.getMaxTime()) * chartWidth;
            const x2 = padding + (nextPoint.t / this.getMaxTime()) * chartWidth;

            const normalizedV1 = Math.min(point.v, yMax);
            const normalizedV2 = Math.min(nextPoint.v, yMax);

            const y1 = height - padding - ((normalizedV1 / yMax) * chartHeight);
            const y2 = height - padding - ((normalizedV2 / yMax) * chartHeight);

            // Calcular desviación del baseline para determinar color
            const deviation = ((point.v - avgBaseline) / avgBaseline) * 100;
            const segmentColor = this.getDeviationColor(deviation, baseColor);

            this.ctx.strokeStyle = segmentColor;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }

    /**
     * v2.0: Obtener color según desviación del baseline
     */
    getDeviationColor(deviationPercent, baseColor) {
        if (deviationPercent > 50) return '#ef4444'; // Rojo - Alto estrés
        if (deviationPercent > 20) return '#f59e0b'; // Naranja - Moderado
        if (deviationPercent > 0) return baseColor;  // Color base - Normal alto
        return '#22c55e'; // Verde - Por debajo del promedio
    }

    /**
     * Validar
     */
    validate(data) {
        if (!super.validate(data)) return false;
        return typeof data.currentTime === 'number';
    }

    /**
     * Render (actualizar tiempo)
     */
    render(data) {
        this.currentTime = data.currentTime;
        this.renderChart();
    }

    /**
     * Obtener tiempo máximo
     */
    getMaxTime() {
        if (this.dataPoints.length === 0) return 100;
        return Math.max(...this.dataPoints.map(p => p.t));
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JitterShimmerChartComponent;
}
