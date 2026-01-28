/**
 * ContradiccionesComponent - Muestra contradicciones detectadas
 * 
 * Panel que lista las contradicciones encontradas en el análisis
 */
class ContradiccionesComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'ContradiccionesComponent',
            debug: true
        });

        this.contradicciones = [];
    }

    /**
     * Cargar contradicciones
     */
    loadContradicciones(contradicciones) {
        this.contradicciones = contradicciones || [];
        this.renderPanel();
        this.log(`Loaded ${this.contradicciones.length} contradicciones`);
    }

    /**
     * Renderizar panel de contradicciones
     */
    renderPanel() {
        // Si no hay contradicciones, mostrar mensaje positivo
        if (this.contradicciones.length === 0) {
            this.element.innerHTML = `
                <div style="
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 8px;
                    padding: 16px;
                    text-align: center;
                ">
                    <div style="font-size: 24px; margin-bottom: 8px;">✅</div>
                    <div style="color: #22c55e; font-weight: bold; font-size: 14px;">
                        No se detectaron contradicciones
                    </div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 4px;">
                        El discurso es coherente y consistente
                    </div>
                </div>
            `;
            return;
        }

        // Renderizar contradicciones encontradas
        this.element.innerHTML = `
            <div style="
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 12px;
                overflow: hidden;
            ">
                <!-- Header -->
                <div style="
                    background: linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%);
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                ">
                    <span style="font-size: 24px;">⚠️</span>
                    <div>
                        <div style="color: white; font-weight: bold; font-size: 15px;">
                            Contradicciones Detectadas
                        </div>
                        <div style="color: rgba(255,255,255,0.8); font-size: 12px;">
                            ${this.contradicciones.length} inconsistencia${this.contradicciones.length > 1 ? 's' : ''} encontrada${this.contradicciones.length > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>
                
                <!-- Lista de contradicciones -->
                <div style="padding: 20px;">
                    ${this.contradicciones.map((c, index) => this.renderContradiccion(c, index)).join('')}
                </div>
            </div>
        `;

        this.log('Panel rendered');
    }

    /**
     * Renderizar una contradicción individual
     */
    renderContradiccion(contradiccion, index) {
        const tipo = contradiccion.tipo || 'GENERAL';
        const descripcion = contradiccion.descripcion || contradiccion.contradiccion || '';
        const contexto = contradiccion.contexto || '';
        const timestamp = contradiccion.timestamp || '';
        const gravedad = contradiccion.gravedad || contradiccion.nivel_gravedad || 'MEDIA';

        const gravedadColor = this.getGravedadColor(gravedad);

        return `
            <div style="
                background: rgba(30, 30, 45, 0.6);
                border-left: 4px solid ${gravedadColor};
                border-radius: 8px;
                padding: 16px;
                margin-bottom: ${index < this.contradicciones.length - 1 ? '16px' : '0'};
            ">
                <!-- Header de contradicción -->
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="
                            background: ${gravedadColor};
                            color: white;
                            padding: 4px 10px;
                            border-radius: 12px;
                            font-size: 10px;
                            font-weight: bold;
                            text-transform: uppercase;
                        ">${gravedad}</span>
                        <span style="color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                            ${tipo}
                        </span>
                    </div>
                    ${timestamp ? `
                        <span style="color: #64748b; font-size: 11px;">
                            ⏱️ ${timestamp}
                        </span>
                    ` : ''}
                </div>
                
                <!-- Descripción -->
                <div style="color: rgba(255,255,255,0.95); font-size: 14px; line-height: 1.6; margin-bottom: ${contexto ? '12px' : '0'};">
                    ${descripcion}
                </div>
                
                <!-- Contexto (si existe) -->
                ${contexto ? `
                    <div style="
                        background: rgba(0,0,0,0.3);
                        padding: 12px;
                        border-radius: 6px;
                        border-left: 2px solid #64748b;
                    ">
                        <div style="color: #94a3b8; font-size: 11px; margin-bottom: 4px; font-weight: 600;">
                            CONTEXTO:
                        </div>
                        <div style="color: rgba(255,255,255,0.85); font-size: 12px; line-height: 1.5; font-style: italic;">
                            "${contexto}"
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Validar (no necesita updates)
     */
    validate(data) {
        return true;
    }

    /**
     * Render (componente estático)
     */
    render(data) {
        // No-op - componente estático
    }

    /**
     * Obtener color según gravedad
     */
    getGravedadColor(gravedad) {
        const colors = {
            'BAJA': '#22c55e',
            'MEDIA': '#eab308',
            'ALTA': '#ef4444',
            'CRÍTICA': '#dc2626'
        };
        return colors[gravedad] || '#f59e0b';
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContradiccionesComponent;
}
