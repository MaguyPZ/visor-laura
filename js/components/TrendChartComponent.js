/**
 * TrendChartComponent - Mini gráfico de tendencia
 * 
 * Pequeño gráfico Canvas tipo sparkline para mostrar tendencias
 * Ideal para headers de paneles y visualizaciones compactas
 */
class TrendChartComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'TrendChartComponent',
            debug: true,
            colors: {
                line: '#3b82f6',
                fill: 'rgba(59, 130, 246, 0.1)',
                axis: 'rgba(255, 255, 255, 0.1)'
            }
        });

        this.canvas = null;
        this.ctx = null;
        this.dataPoints = [];
        this.label = '';
    }

    /**
     * Cargar datos del gráfico
     */
    loadData(data) {
        if (!data || !Array.isArray(data.dataPoints)) {
            this.log('No data points provided', 'warn');
            return;
        }

        this.dataPoints = data.dataPoints;
        this.label = data.label || 'Métrica';

        if (data.color) {
            this.config.colors.line = data.color;
            this.config.colors.fill = data.color.replace(')', ', 0.1)').replace('rgb', 'rgba');
        }

        this.render();
        this.log(`Loaded ${this.dataPoints.length} data points`, 'success');
    }

    /**
     * Renderizar gráfico
     */
    render() {
        this.element.innerHTML = `
            <div class="trend-chart">
                <canvas id="${this.config.elementId}_canvas"></canvas>
            </div>
        `;

        // Inicializar canvas después de que el DOM esté listo
        setTimeout(() => this.initCanvas(), 100);
    }

    /**
     * Inicializar canvas
     */
    initCanvas() {
        this.canvas = document.getElementById(`${this.config.elementId}_canvas`);
        if (!this.canvas) {
            this.log('Canvas not found', 'error');
            return;
        }

        this.ctx = this.canvas.getContext('2d');

        // Set canvas size
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 60;

        this.drawChart();
    }

    /**
     * Dibujar gráfico
     */
    drawChart() {
        if (!this.ctx || this.dataPoints.length === 0) return;

        const { width, height } = this.canvas;
        const padding = 5;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Clear
        this.ctx.clearRect(0, 0, width, height);

        // Find min/max
        const minVal = Math.min(...this.dataPoints);
        const maxVal = Math.max(...this.dataPoints);
        const range = maxVal - minVal || 1;

        // Calculate points
        const points = this.dataPoints.map((val, i) => {
            const x = padding + (i / (this.dataPoints.length - 1)) * chartWidth;
            const y = height - padding - ((val - minVal) / range) * chartHeight;
            return { x, y };
        });

        // Draw filled area
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, height - padding);
        points.forEach(p => this.ctx.lineTo(p.x, p.y));
        this.ctx.lineTo(points[points.length - 1].x, height - padding);
        this.ctx.closePath();
        this.ctx.fillStyle = this.config.colors.fill;
        this.ctx.fill();

        // Draw line
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        points.forEach(p => this.ctx.lineTo(p.x, p.y));
        this.ctx.strokeStyle = this.config.colors.line;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.log('Chart drawn', 'success');
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
    module.exports = TrendChartComponent;
}
