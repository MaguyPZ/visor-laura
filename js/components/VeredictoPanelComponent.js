/**
 * VeredictoPanelComponent - Panel completo del veredicto GPT-4
 * 
 * Muestra análisis completo: conclusión, recomendaciones, indicadores
 */
class VeredictoPanelComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'VeredictoPanelComponent',
            debug: true
        });

        this.veredicto = null;
        this.isExpanded = false;
    }

    /**
     * Cargar datos del veredicto
     */
    loadVeredicto(veredictoData, conclusionProfesional) {
        this.veredicto = veredictoData;
        this.conclusionProfesional = conclusionProfesional;
        this.renderPanel();
        this.log('Veredicto panel loaded');
    }

    /**
     * Renderizar panel completo
     */
    renderPanel() {
        if (!this.veredicto) return;

        const clasificacion = this.veredicto.clasificacion || 'DESCONOCIDO';
        const titulo = this.veredicto.titulo_veredicto || 'Análisis Completado';
        const tipo = this.veredicto.tipo_comportamiento_detectado || '';
        const resumen = this.veredicto.resumen_detallado || '';
        const indicadores = this.veredicto.indicadores_clave || [];
        const momentos = this.veredicto.momentos_mas_sospechosos || [];
        const ocultando = this.veredicto.que_esta_ocultando || 'No se detectaron omisiones';
        const recomendacion = this.veredicto.recomendacion_accion || '';

        const { color, icon, bgGradient } = this.getClassificationStyle(clasificacion);

        this.element.innerHTML = `
            <div style="
                background: rgba(30, 30, 45, 0.9);
                border: 1px solid ${color};
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            ">
                <!-- Header (siempre visible) -->
                <div onclick="document.getElementById('${this.config.elementId}').querySelector('.veredicto-content').classList.toggle('expanded')"
                     style="
                         background: ${bgGradient};
                         padding: 16px 20px;
                         cursor: pointer;
                         display: flex;
                         justify-content: space-between;
                         align-items: center;
                         transition: opacity 0.2s;
                     "
                     onmouseover="this.style.opacity='0.9'"
                     onmouseout="this.style.opacity='1'">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 28px;">${icon}</span>
                        <div>
                            <div style="color: white; font-weight: bold; font-size: 16px;">
                                ${titulo}
                            </div>
                            <div style="color: rgba(255,255,255,0.8); font-size: 12px;">
                                Clasificación: ${clasificacion}
                            </div>
                        </div>
                    </div>
                    <div style="color: rgba(255,255,255,0.7); font-size: 12px;">
                        ▼ Click para expandir
                    </div>
                </div>
                
                <!-- Content (expandible) -->
                <div class="veredicto-content" style="
                    max-height: 0;
                    overflow: hidden;
                    transition: max-height 0.3s ease-out;
                    padding: 0 20px;
                ">
                    <div style="padding: 20px 0;">
                        <!-- Tipo de comportamiento -->
                        ${tipo ? `
                            <div style="margin-bottom: 20px;">
                                <h4 style="color: ${color}; font-size: 13px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    📋 Tipo de Comportamiento
                                </h4>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5;">
                                    ${tipo}
                                </p>
                            </div>
                        ` : ''}
                        
                        <!-- Resumen detallado -->
                        ${resumen ? `
                            <div style="margin-bottom: 20px;">
                                <h4 style="color: ${color}; font-size: 13px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    📊 Resumen del Análisis
                                </h4>
                                <p style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.6;">
                                    ${resumen}
                                </p>
                            </div>
                        ` : ''}
                        
                        <!-- Conclusión profesional -->
                        ${this.conclusionProfesional ? `
                            <div style="margin-bottom: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 8px;">
                                <h4 style="color: ${color}; font-size: 13px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    👨‍⚖️ Conclusión Profesional
                                </h4>
                                <p style="color: rgba(255,255,255,0.95); font-size: 14px; line-height: 1.6; font-style: italic;">
                                    ${this.conclusionProfesional}
                                </p>
                            </div>
                        ` : ''}
                        
                        <!-- Grid de 2 columnas -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                            <!-- Indicadores clave -->
                            ${indicadores.length > 0 ? `
                                <div>
                                    <h4 style="color: ${color}; font-size: 13px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                        💡 Indicadores Clave
                                    </h4>
                                    <ul style="list-style: none; padding: 0; margin: 0;">
                                        ${indicadores.map(ind => `
                                            <li style="
                                                color: rgba(255,255,255,0.9);
                                                font-size: 13px;
                                                line-height: 1.5;
                                                margin-bottom: 8px;
                                                padding-left: 20px;
                                                position: relative;
                                            ">
                                                <span style="position: absolute; left: 0; color: ${color};">▸</span>
                                                ${ind}
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            
                            <!-- Momentos sospechosos -->
                            ${momentos.length > 0 ? `
                                <div>
                                    <h4 style="color: #ef4444; font-size: 13px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                                        🚩 Momentos Sospechosos
                                    </h4>
                                    <ul style="list-style: none; padding: 0; margin: 0;">
                                        ${momentos.map(mom => `
                                            <li style="
                                                color: rgba(255,255,255,0.9);
                                                font-size: 13px;
                                                line-height: 1.5;
                                                margin-bottom: 8px;
                                                padding-left: 20px;
                                                position: relative;
                                            ">
                                                <span style="position: absolute; left: 0; color: #ef4444;">▸</span>
                                                ${mom}
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Qué está ocultando -->
                        ${ocultando !== 'No se detectaron indicadores de omisión' && ocultando !== 'No se detectaron omisiones' ? `
                            <div style="margin-bottom: 20px; padding: 15px; background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; border-radius: 6px;">
                                <h4 style="color: #ef4444; font-size: 13px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    🔍 Posibles Omisiones
                                </h4>
                                <p style="color: rgba(255,255,255,0.9); font-size: 13px; line-height: 1.5;">
                                    ${ocultando}
                                </p>
                            </div>
                        ` : ''}
                        
                        <!-- Recomendación -->
                        ${recomendacion ? `
                            <div style="padding: 15px; background: rgba(59, 130, 246, 0.1); border-left: 3px solid #3b82f6; border-radius: 6px;">
                                <h4 style="color: #3b82f6; font-size: 13px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                                    💼 Recomendación de Acción
                                </h4>
                                <p style="color: rgba(255,255,255,0.9); font-size: 13px; line-height: 1.6;">
                                    ${recomendacion}
                                </p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <style>
                    .veredicto-content.expanded {
                        max-height: 2000px !important;
                        padding: 0 20px !important;
                    }
                </style>
            </div>
        `;

        this.log('Panel rendered');
    }

    /**
     * Validar (no necesita actualización en tiempo real)
     */
    validate(data) {
        return true;
    }

    /**
     * Render (panel estático)
     */
    render(data) {
        // No-op - panel es estático
    }

    /**
     * Obtener estilo según clasificación
     */
    getClassificationStyle(clasificacion) {
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
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VeredictoPanelComponent;
}
