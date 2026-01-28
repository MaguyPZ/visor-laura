/**
 * StressChartComponent - Gráfico de estrés temporal
 * 
 * Visualización de estrés a lo largo del tiempo con marcadores de momentos críticos
 */
class StressChartComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'StressChartComponent',
            debug: true
        });

        this.dataPoints = [];
        this.criticalMoments = [];
        this.canvas = null;
        this.ctx = null;
        this.currentTime = 0;
    }

    /**
     * Cargar datos de estrés
     */
    loadData(dataPoints, criticalMoments = []) {
        this.dataPoints = dataPoints;
        this.criticalMoments = criticalMoments;

        // Esperar un momento antes de crear el chart
        setTimeout(() => {
            try {
                this.createChart();
            } catch (error) {
                this.handleError('loadData', error);
            }
        }, 200);

        this.log(`Loaded ${dataPoints.length} data points for chart`);
    }

    /**
     * Crear el canvas y renderizar chart inicial
     */
    createChart() {
        if (!this.element) {
            this.log('Element not found', 'warn');
            return;
        }

        const width = Math.max(this.element.offsetWidth, 600);
        const height = 200;

        this.element.innerHTML = `
            <div style="background: rgba(30, 30, 45, 0.8); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 16px;">
                <h3 style="margin-bottom: 12px; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">
                    📈 GRÁFICO DE ESTRÉS TEMPORAL
                </h3>
                <canvas id="stressChartCanvas" width="${width}" height="${height}"></canvas>
                <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; color: #94a3b8;">
                    <div>
                        <span style="display: inline-block; width: 12px; height: 12px; background: #22c55e; border-radius: 2px; margin-right: 4px;"></span>
                        Bajo
                        <span style="display: inline-block; width: 12px; height: 12px; background: #eab308; border-radius: 2px; margin: 0 4px 0 12px;"></span>
                        Moderado
                        <span style="display: inline-block; width: 12px; height: 12px; background: #ef4444; border-radius: 2px; margin: 0 4px 0 12px;"></span>
                        Alto
                    </div>
                    <div>
                        <span style="color: #f59e0b;">🚩</span> Momentos críticos
                    </div>
                </div>
            </div>
        `;

        // Esperar que el DOM se actualice
        setTimeout(() => {
            this.canvas = document.getElementById('stressChartCanvas');
            if (!this.canvas) {
                this.log('Canvas not found after creation', 'error');
                return;
            }

            this.ctx = this.canvas.getContext('2d');
            this.renderChart();
            this.log('Chart rendered successfully');
        }, 50);
    }

    /**
     * Renderizar el gráfico completo
     */
    renderChart() {
        if (!this.ctx || this.dataPoints.length === 0) {
            this.log('Cannot render: no context or no data', 'warn');
            return;
        }

        const width = this.canvas.width;
        const height = this.canvas.height;
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);

        // Limpiar canvas
        this.ctx.clearRect(0, 0, width, height);

        // Background
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
        this.ctx.fillRect(0, 0, width, height);

        // Grid lines
        this.ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight * i / 4);
            this.ctx.beginPath();
            this.ctx.moveTo(padding, y);
            this.ctx.lineTo(width - padding, y);
            this.ctx.stroke();
        }

        // Y-axis labels
        this.ctx.fillStyle = '#64748B';
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'right';
        for (let i = 0; i <= 4; i++) {
            const value = 100 - (i * 25);
            const y = padding + (chartHeight * i / 4);
            this.ctx.fillText(`${value}%`, padding - 10, y + 4);
        }

        // Momentos críticos (marcadores verticales)
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

        // Línea de estrés
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();

        this.dataPoints.forEach((point, index) => {
            const x = padding + (point.t / this.getMaxTime()) * chartWidth;
            const y = height - padding - (point.e * chartHeight);

            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Área bajo la curva
        const gradient = this.ctx.createLinearGradient(0, padding, 0, height - padding);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.dataPoints.forEach((point, index) => {
            const x = padding + (point.t / this.getMaxTime()) * chartWidth;
            const y = height - padding - (point.e * chartHeight);

            if (index === 0) {
                this.ctx.moveTo(x, height - padding);
                this.ctx.lineTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });
        this.ctx.lineTo(width - padding, height - padding);
        this.ctx.closePath();
        this.ctx.fill();

        // Marcador de tiempo actual
        if (this.currentTime > 0) {
            const x = padding + (this.currentTime / this.getMaxTime()) * chartWidth;

            this.ctx.strokeStyle = '#22c55e';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(x, padding);
            this.ctx.lineTo(x, height - padding);
            this.ctx.stroke();

            // Círculo en la línea
            const currentPoint = this.dataPoints.find(p => Math.abs(p.t - this.currentTime) < 1);
            if (currentPoint) {
                const y = height - padding - (currentPoint.e * chartHeight);
                this.ctx.fillStyle = '#22c55e';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 6, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    /**
     * Validar datos
     */
    validate(data) {
        if (!super.validate(data)) return false;
        return typeof data.currentTime === 'number';
    }

    /**
     * Actualizar con tiempo actual
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
    module.exports = StressChartComponent;
}
