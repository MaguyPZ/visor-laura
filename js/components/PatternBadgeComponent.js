/**
 * PatternBadgeComponent - Muestra patrones psicológicos detectados
 * 
 * Overlay que muestra el tipo de comportamiento y veredicto
 */
class PatternBadgeComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'PatternBadgeComponent',
            debug: true
        });

        this.veredicto = null;
        this.isVisible = false;
    }

    /**
     * Cargar veredicto y datos de análisis
     */
    loadVeredicto(veredictoData) {
        this.veredicto = veredictoData;
        this.log(`Loaded veredicto: ${veredictoData.clasificacion}`);
    }

    /**
     * Mostrar badge de patrón al inicio
     */
    show() {
        if (!this.veredicto || this.isVisible) return;

        const clasificacion = this.veredicto.clasificacion || 'DESCONOCIDO';
        const tipo = this.veredicto.tipo_comportamiento_detectado || '';
        const probabilidad = this.veredicto.probabilidad_engano || 'DESCONOCIDA';
        const nivel_riesgo = this.veredicto.nivel_de_riesgo || 'MEDIO';

        const { color, icon, bgGradient } = this.getPatternStyle(clasificacion);

        this.element.innerHTML = `
            <div class="pattern-badge" style="
                position: fixed;
                top: 100px;
                right: 20px;
                background: ${bgGradient};
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                border: 2px solid ${color};
                max-width: 380px;
                z-index: 999;
                animation: slideInRight 0.5s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                    <span style="font-size: 32px;">${icon}</span>
                    <div style="flex: 1;">
                        <div style="color: ${color}; font-weight: bold; font-size: 16px; text-transform: uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                            PATRÓN DETECTADO
                        </div>
                        <div style="color: rgba(255,255,255,0.9); font-size: 12px;">
                            Análisis GPT-4 + Métricas
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: rgba(0,0,0,0.3);
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 10px;
                    border-left: 4px solid ${color};
                ">
                    <div style="color: ${color}; font-size: 14px; font-weight: bold; margin-bottom: 6px;">
                        ${clasificacion}
                    </div>
                    <div style="color: rgba(255,255,255,0.95); font-size: 12px; line-height: 1.4;">
                        ${this.truncate(tipo, 120)}
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
                    <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; text-align: center;">
                        <div style="color: rgba(255,255,255,0.7); font-size: 10px; margin-bottom: 4px;">
                            PROBABILIDAD ENGAÑO
                        </div>
                        <div style="color: ${this.getProbabilityColor(probabilidad)}; font-size: 14px; font-weight: bold;">
                            ${probabilidad}
                        </div>
                    </div>
                    <div style="background: rgba(0,0,0,0.2); padding: 8px; border-radius: 6px; text-align: center;">
                        <div style="color: rgba(255,255,255,0.7); font-size: 10px; margin-bottom: 4px;">
                            NIVEL DE RIESGO
                        </div>
                        <div style="color: ${this.getRiskColor(nivel_riesgo)}; font-size: 14px; font-weight: bold;">
                            ${nivel_riesgo}
                        </div>
                    </div>
                </div>
                
                ${this.veredicto.indicadores_clave && this.veredicto.indicadores_clave.length > 0 ? `
                    <div style="margin-top: 10px;">
                        <div style="color: rgba(255,255,255,0.8); font-size: 10px; margin-bottom: 6px; font-weight: bold;">
                            💡 INDICADORES CLAVE:
                        </div>
                        <div style="color: rgba(255,255,255,0.85); font-size: 11px; line-height: 1.3;">
                            ${this.veredicto.indicadores_clave.slice(0, 2).map(ind =>
            `• ${this.truncate(ind, 100)}`
        ).join('<br>')}
                        </div>
                    </div>
                ` : ''}
                
                <button onclick="document.getElementById('${this.config.elementId}').innerHTML=''" 
                        style="
                            margin-top: 12px;
                            width: 100%;
                            padding: 8px;
                            background: rgba(255,255,255,0.1);
                            border: 1px solid rgba(255,255,255,0.3);
                            border-radius: 6px;
                            color: white;
                            cursor: pointer;
                            font-size: 11px;
                            transition: background 0.2s;
                        "
                        onmouseover="this.style.background='rgba(255,255,255,0.2)'"
                        onmouseout="this.style.background='rgba(255,255,255,0.1)'">
                    ✕ Cerrar
                </button>
            </div>
            
            <style>
                @keyframes slideInRight {
                    from {
                        transform: translateX(450px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
            </style>
        `;

        this.isVisible = true;
        this.log(`Pattern badge shown: ${clasificacion}`);
    }

    /**
     * Validar datos (no necesita tiempo actual)
     */
    validate(data) {
        return true;
    }

    /**
     * Render (el badge se muestra al inicio, no necesita updates)
     */
    render(data) {
        // No-op - el badge se muestra una vez al cargar
    }

    /**
     * Obtener estilo según clasificación
     */
    getPatternStyle(clasificacion) {
        const styles = {
            'HONESTO': {
                color: '#22c55e',
                icon: '✅',
                bgGradient: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)'
            },
            'EVASIVO': {
                color: '#f59e0b',
                icon: '⚠️',
                bgGradient: 'linear-gradient(135deg, #92400e 0%, #78350f 100%)'
            },
            'OMISIÓN': {
                color: '#8b5cf6',
                icon: '🔍',
                bgGradient: 'linear-gradient(135deg, #5b21b6 0%, #4c1d95 100%)'
            },
            'ENGAÑOSO': {
                color: '#ef4444',
                icon: '🚫',
                bgGradient: 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)'
            }
        };

        return styles[clasificacion] || {
            color: '#3b82f6',
            icon: '📊',
            bgGradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)'
        };
    }

    /**
     * Color según probabilidad de engaño
     */
    getProbabilityColor(prob) {
        const colors = {
            'BAJA': '#22c55e',
            'MEDIA': '#eab308',
            'ALTA': '#ef4444'
        };
        return colors[prob] || '#3b82f6';
    }

    /**
     * Color según nivel de riesgo
     */
    getRiskColor(riesgo) {
        const colors = {
            'BAJO': '#22c55e',
            'MEDIO': '#eab308',
            'ALTO': '#ef4444'
        };
        return colors[riesgo] || '#3b82f6';
    }

    /**
     * Truncar texto
     */
    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PatternBadgeComponent;
}
