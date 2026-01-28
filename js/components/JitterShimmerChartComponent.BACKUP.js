/**
 * JitterShimmerChartComponent - Gráfico de inestabilidad vocal
 * 
 * Visualiza jitter (variabilidad de tono) y shimmer (variabilidad de volumen)
 * a lo largo del tiempo para detectar estrés vocal
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
    }

    /**
     * Cargar datos
     */
    loadData(dataPoints, criticalMoments = []) {
        this.dataPoints = dataPoints;
        this.criticalMoments = criticalMoments;

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
     * Crear canvas y renderizar
     */
    createChart() {
        if (!this.element) {
            this.log('Element not found', 'warn');
            return;
        }

        const width = Math.max(this.element.offsetWidth, 600);
        const height = 250;

        this.element.innerHTML = `
            <div style="background: rgba(30, 30, 45, 0.8); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 16px;">
                <!-- Header con descripción -->
                <div style="margin-bottom: 12px;">
                    <h3 style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold; margin-bottom: 8px;">
                        📊 INESTABILIDAD VOCAL (Jitter / Shimmer)
                    </h3>
                    <div style="background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; padding: 10px; border-radius: 6px; margin-bottom: 12px;">
                        <div style="color: rgba(255,255,255,0.9); font-size: 11px; line-height: 1.6;">
                            <strong style="color: #3b82f6;">¿Qué muestra?</strong><br>
                            • <strong style="color: #60a5fa;">Jitter (azul):</strong> Qué tan temblorosa/inestable es la voz<br>
                            • <strong style="color: #f87171;">Shimmer (rojo):</strong> Qué tan irregular es el volumen<br>
                            <br>
                            <strong style="color: #22c55e;">📌 Interpretación:</strong><br>
                            • Líneas bajas (verde) = Voz estable y relajada ✅<br>
                            • Picos altos (rojo) = Tensión o estrés vocal ⚠️<br>
                            • Varios picos = Persona nerviosa/estresada 🔴
                        </div>
                    </div>
                </div>
                
                <canvas id="jitterShimmerCanvas" width="${width}" height="${height}"></canvas>
                
                <!-- Leyenda -->
                <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; color: #94a3b8;">
                    <div style="display: flex; gap: 20px;">
                        <div>
                            <span style="display: inline-block; width: 16px; height: 3px; background: #60a5fa; margin-right: 4px;"></span>
                            Jitter (inestabilidad tono)
                        </div>
                        <div>
                            <span style="display: inline-block; width: 16px; height: 3px; background: #f87171; margin-right: 4px;"></span>
                            Shimmer (variabilidad volumen)
                        </div>
                    </div>
                    <div>
                        <span style="color: #22c55e;">●</span> Normal
                        <span style="color: #eab308; margin-left: 8px;">●</span> Moderado
                        <span style="color: #ef4444; margin-left: 8px;">●</span> Alto
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
            this.renderChart();
            this.log('Chart rendered successfully');
        }, 50);
    }

    /**
     * Renderizar gráfico
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

        // Limpiar
        this.ctx.clearRect(0, 0, width, height);

        // Background
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
        this.ctx.fillRect(0, 0, width, height);

        // Grid horizontal
        this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight * i / 5);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(width - padding, y);
            this.ctx.stroke();
        }

        // Labels Y-axis (porcentajes)
        this.ctx.fillStyle = '#64748B';
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const value = 5 - i; // 5%, 4%, 3%, 2%, 1%, 0%
            const y = padding + (chartHeight * i / 5);
            this.ctx.fillText(`${value}%`, padding - 10, y + 4);
        }

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

        // Áreas de fondo por nivel (para jitter y shimmer)
        this.drawLevelAreas(padding, chartWidth, chartHeight, height);

        // Línea de Jitter (azul) - normalizar de 0-1 a 0-5%
        const jitterData = this.dataPoints.map(p => ({
            t: p.t, 
            v: p.p // Ya viene como porcentaje (ej: 1.72%)
        }));
        this.drawLine(jitterData, '#60a5fa', padding, chartWidth, chartHeight, height);
        
        // Línea de Shimmer (rojo) - normalizar de 0-1 a 0-5%
        const shimmerData = this.dataPoints.map(p => ({
            t: p.t, 
            v: (p.shimmer || p.p * 1.5) // Ya como porcentaje
        }));
        this.drawLine(shimmerData, '#f87171', padding, chartWidth, chartHeight, height);

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
     * Dibujar áreas de nivel (verde/amarillo/rojo)
     */
    drawLevelAreas(padding, chartWidth, chartHeight, height) {
        // Área ALTA (rojo) - >3%
        const highY = padding + (chartHeight * 2 / 5); // 3% línea
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
        this.ctx.fillRect(padding, padding, chartWidth, highY - padding);

        // Área MEDIA (amarillo) - 2-3%
        const medY = padding + (chartHeight * 3 / 5); // 2% línea
        this.ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
        this.ctx.fillRect(padding, highY, chartWidth, medY - highY);

        // Área BAJA (verde) - <2%
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
        this.ctx.fillRect(padding, medY, chartWidth, (height - padding) - medY);
    }

    /**
     * Dibujar una línea
     */
    drawLine(data, color, padding, chartWidth, chartHeight, height) {
        if (data.length === 0) return;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 4;
        this.ctx.beginPath();

        data.forEach((point, index) => {
            const x = padding + (point.t / this.getMaxTime()) * chartWidth;
            // Normalizar a escala 0-5% (max 5%)
            const normalizedV = Math.min(point.v, 5);
            const y = height - padding - ((normalizedV / 5) * chartHeight);

            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
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
