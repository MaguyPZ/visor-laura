/**
 * SintesisPanelComponent - Panel expandible con conclusión profesional
 * 
 * Muestra la síntesis narrativa/conclusión del análisis GPT-4
 * Colapsable para ahorrar espacio
 */
class SintesisPanelComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'SintesisPanelComponent',
            debug: true,
            colors: {
                primary: '#8b5cf6'  // Púrpura
            }
        });

        this.isExpanded = false;
        this.sintesis = null;
    }

    /**
     * Cargar síntesis
     */
    loadSintesis(conclusionData) {
        if (!conclusionData) {
            this.log('No conclusión data provided', 'warn');
            return;
        }

        // Puede ser un string o un objeto con sintesis_narrativa
        if (typeof conclusionData === 'string') {
            this.sintesis = conclusionData;
        } else if (conclusionData.sintesis_narrativa) {
            this.sintesis = conclusionData.sintesis_narrativa;
        } else if (conclusionData.conclusion) {
            this.sintesis = conclusionData.conclusion;
        } else {
            this.sintesis = JSON.stringify(conclusionData, null, 2);
        }

        this.render();
        this.log('Síntesis loaded', 'success');
    }

    /**
     * Toggle expansión
     */
    toggle() {
        this.isExpanded = !this.isExpanded;
        const content = this.element.querySelector('.sintesis-content');
        if (content) {
            content.classList.toggle('expanded');
        }

        const icon = this.element.querySelector('.toggle-icon');
        if (icon) {
            icon.textContent = this.isExpanded ? '▼' : '▶';
        }
    }

    /**
     * Renderizar panel
     */
    render() {
        if (!this.sintesis) {
            this.element.innerHTML = '<p style="color: #666;">No hay síntesis disponible</p>';
            return;
        }

        this.element.innerHTML = `
            <div class="sintesis-panel">
                <div class="sintesis-toggle" onclick="window.sintesisPanelToggle()">
                    <h3 style="color: ${this.config.colors.primary}; margin: 0; display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <span class="toggle-icon">${this.isExpanded ? '▼' : '▶'}</span>
                        📋 SÍNTESIS PROFESIONAL
                    </h3>
                </div>
                <div class="sintesis-content ${this.isExpanded ? 'expanded' : ''}" style="margin-top: 12px;">
                    <div style="color: #e0e0e0; line-height: 1.6; white-space: pre-wrap;">
                        ${this.sintesis}
                    </div>
                </div>
            </div>
        `;

        // Register global toggle function
        window.sintesisPanelToggle = () => this.toggle();
    }

    /**
     * Update method (not used, but required by BaseIndicator)
     */
    update(data) {
        // Este componente no se actualiza durante simulación
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SintesisPanelComponent;
}
