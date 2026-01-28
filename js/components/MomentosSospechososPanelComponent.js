/**
 * MomentosSospechososPanelComponent - Panel de momentos sospechosos (MEDIA)
 * 
 * Lista de momentos de importancia MEDIA
 * Similar a RedFlagComponent pero filtrado
 */
class MomentosSospechososPanelComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'MomentosSospechososPanelComponent',
            debug: true,
            colors: {
                suspicious: '#f97316'  // Naranja
            }
        });

        this.momentos = [];
    }

    /**
     * Cargar momentos sospechosos
     */
    loadMomentos(momentosCriticos) {
        if (!momentosCriticos || !Array.isArray(momentosCriticos)) {
            this.log('No momentos críticos provided', 'warn');
            this.momentos = [];
        } else {
            // Filtrar solo importancia MEDIA
            this.momentos = momentosCriticos.filter(m => m.importancia === 'MEDIA');
        }

        this.render();
        this.log(`Loaded ${this.momentos.length} suspicious moments`, 'success');
    }

    /**
     * Renderizar panel
     */
    render() {
        if (this.momentos.length === 0) {
            this.element.innerHTML = `
                <div class="momentos-sospechosos-panel">
                    <h3 style="color: ${this.config.colors.suspicious}; margin: 0 0 10px 0;">
                        ⚠️ MOMENTOS SOSPECHOSOS
                        <span style="background: rgba(249, 115, 22, 0.2); padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">
                            0
                        </span>
                    </h3>
                    <p style="color: #888; font-size: 13px;">No hay momentos sospechosos detectados</p>
                </div>
            `;
            return;
        }

        const itemsHTML = this.momentos.map((m, i) => {
            const tipo = m.tipo || 'SOSPECHOSO';
            const timestamp = m.timestamp || `${Math.floor(m.segundos_inicio / 60)}:${String(Math.floor(m.segundos_inicio % 60)).padStart(2, '0')}`;
            const descripcion = m.descripcion || m.analisis_integrado || 'Momento sospechoso detectado';

            return `
                <div class="momento-sospechoso-item">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="color: ${this.config.colors.suspicious}; font-weight: bold; font-size: 12px;">
                            ${tipo}
                        </span>
                        <span style="color: #94a3b8; font-size: 11px;">
                            ${timestamp}
                        </span>
                    </div>
                    <div style="color: #e0e0e0; font-size: 13px; line-height: 1.4;">
                        ${descripcion}
                    </div>
                </div>
            `;
        }).join('');

        this.element.innerHTML = `
            <div class="momentos-sospechosos-panel">
                <h3 style="color: ${this.config.colors.suspicious}; margin: 0 0 12px 0;">
                    ⚠️ MOMENTOS SOSPECHOSOS
                    <span style="background: rgba(249, 115, 22, 0.2); padding: 2px 8px; border-radius: 12px; font-size: 11px; margin-left: 8px;">
                        ${this.momentos.length}
                    </span>
                </h3>
                <div style="max-height: 400px; overflow-y: auto;">
                    ${itemsHTML}
                </div>
            </div>
        `;
    }

    /**
     * Update method (not used)
     */
    update(data) {
        // Este componente no se actualiza durante simulación
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MomentosSospechososPanelComponent;
}
