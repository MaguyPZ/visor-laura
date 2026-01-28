/**
 * PsychologicalImpactComponent
 * Muestra el panel de patrones psicológicos (Racionalización, Minimización).
 * Estilo Azul/Cerebral diferenciado.
 */
class PsychologicalImpactComponent extends BaseIndicator {
    constructor(containerId) {
        super({
            elementId: containerId,
            name: 'PsychologicalImpactComponent',
            debug: true
        });
        this.patterns = [];
    }

    /**
     * Carga y renderiza los patrones psicológicos
     * @param {Array} patterns - Lista de momentos críticos filtrados
     */
    loadPatterns(patterns) {
        try {
            this.patterns = patterns || [];
            this.render();
        } catch (error) {
            console.error('PsychologicalImpactComponent: Error loading patterns', error);
        }
    }

    render() {
        if (!this.element) return;

        // Ocultar si no hay patrones
        if (!this.patterns || this.patterns.length === 0) {
            this.element.style.display = 'none';
            return;
        }
        this.element.style.display = 'block';

        try {
            // Estilo específico en línea para diferenciarlo
            let html = `
                <div class="psych-panel" style="
                    margin-bottom: 20px;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    background: rgba(30, 58, 138, 0.1);
                    border-radius: 8px;
                    overflow: hidden;
                ">
                    <h3 class="panel-title" style="
                        background: rgba(30, 58, 138, 0.2); 
                        color: #93c5fd;
                        padding: 10px 15px;
                        margin: 0;
                        font-size: 14px;
                        border-bottom: 1px solid rgba(59, 130, 246, 0.2);
                        display: flex; align-items: center;
                    ">
                        <span style="font-size: 18px; margin-right: 8px;">🧠</span> Análisis Psicológico
                    </h3>
                    <div class="moments-list">
            `;

            this.patterns.forEach((moment, index) => {
                const timeSeconds = this.parseTime(moment.timestamp || moment.tiempo);
                let desc = moment.descripcion || moment.analisis_integrado || "";

                // Limpiar prefijo "Racionalización:" si ya está en el título o simplificar
                // desc = desc.replace('Racionalización:', '<b>Racionalización:</b>'); 

                html += `
                    <div class="moment-item psych-item" 
                         onclick="if(window.psychologicalImpact) window.psychologicalImpact.jumpTo(${timeSeconds})" 
                         data-time="${timeSeconds}"
                         style="border-left: 3px solid #60a5fa; margin-bottom: 8px;">
                        <div class="moment-time" style="color: #60a5fa;">
                            <span class="clock-icon">🕐</span> ${moment.timestamp || moment.tiempo}
                        </div>
                        <div class="moment-desc" style="color: #bfdbfe;">
                            ${desc}
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;

            this.element.innerHTML = html;
        } catch (error) {
            console.error('PsychologicalImpactComponent: Error rendering', error);
            this.element.innerHTML = '<div class="error-msg">Error visualizando patrones</div>';
        }
    }

    jumpTo(seconds) {
        try {
            const video = document.getElementById('mainVideo');
            if (video && typeof video.currentTime !== 'undefined') {
                video.currentTime = seconds;
                if (video.paused) video.play().catch(e => { });
                this.highlightCurrent(seconds);
            }
        } catch (error) {
            console.error('PsychologicalImpactComponent: Error jumping to time', error);
        }
    }

    update(data) {
        if (!data || data.currentTime === undefined) return;
        this.highlightCurrent(data.currentTime);
    }

    highlightCurrent(currentTime) {
        if (!this.element) return;
        const items = this.element.querySelectorAll('.moment-item');
        if (!items || items.length === 0) return;

        let activeIndex = -1;
        for (let i = 0; i < this.patterns.length; i++) {
            const timeSeconds = this.parseTime(this.patterns[i].timestamp || this.patterns[i].tiempo);
            // El highlight dura mientras estemos en el rango si existe, o solo un poco
            // Usamos lógica simple: highlight si ya pasó start
            if (currentTime >= timeSeconds) {
                activeIndex = i;
            } else {
                break;
            }
        }

        items.forEach((item, index) => {
            if (index === activeIndex) {
                item.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
            } else {
                item.style.backgroundColor = 'transparent';
            }
        });
    }

    parseTime(timeStr) {
        // ... (misma lógica de parseo que KeyMoments)
        try {
            if (typeof timeStr === 'number') return timeStr;
            if (!timeStr) return 0;
            let cleanTime = timeStr.toString();
            if (cleanTime.includes('-')) cleanTime = cleanTime.split('-')[0];
            cleanTime = cleanTime.replace(/[^\d:]/g, '');
            const parts = cleanTime.split(':');
            if (parts.length === 2) return (parseInt(parts[0]) * 60) + parseInt(parts[1]);
            return parseFloat(cleanTime) || 0;
        } catch (e) { return 0; }
    }
}
