/**
 * KeyMomentsComponent
 * Muestra una lista de momentos clave y permite navegar a ellos en el video.
 * Implementación robusta y defensiva.
 */
class KeyMomentsComponent extends BaseIndicator {
    constructor(containerId) {
        super({
            elementId: containerId,
            name: 'KeyMomentsComponent',
            debug: true
        });
        this.moments = [];
    }

    /**
     * Carga y renderiza los momentos clave
     * @param {Array} moments - Lista de objetos { tiempo: "MM:SS", descripcion: "..." }
     */
    loadMoments(moments) {
        try {
            this.moments = moments || [];
            this.render();
        } catch (error) {
            console.error('KeyMomentsComponent: Error loading moments', error);
        }
    }

    render() {
        if (!this.element) return; // Guard clause

        if (!this.moments || this.moments.length === 0) {
            this.element.innerHTML = '<div class="no-data-moments" style="display:none;"></div>'; // Ocultar si no hay datos
            return;
        }

        try {
            let html = `
                <div class="key-moments-panel">
                    <h3 class="panel-title">🔑 Momentos Técnicos - Ve Directo</h3>
                    <div class="moments-list">
            `;

            this.moments.forEach((moment, index) => {
                const timeSeconds = this.parseTime(moment.tiempo);

                html += `
                    <div class="moment-item" onclick="if(window.keyMoments) window.keyMoments.jumpTo(${timeSeconds})" data-time="${timeSeconds}">
                        <div class="moment-time">
                            <span class="clock-icon">🕐</span> ${moment.tiempo}
                        </div>
                        <div class="moment-desc">
                            ${moment.descripcion}
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
            console.error('KeyMomentsComponent: Error rendering', error);
            this.element.innerHTML = '<div class="error-msg">Error visualizando momentos clave</div>';
        }
    }

    /**
     * Navega al segundo especificado en el video
     */
    jumpTo(seconds) {
        try {
            const video = document.getElementById('mainVideo');
            if (video && typeof video.currentTime !== 'undefined') {
                video.currentTime = seconds;
                // Intentar reproducir si está pausado
                if (video.paused) {
                    video.play().catch(e => console.warn('Auto-play prevented:', e));
                }

                // Resaltar visualmente
                this.highlightCurrent(seconds);

                console.log(`KeyMoments: Jumping to ${seconds}s`);
            } else {
                console.warn('KeyMoments: Video element not found or invalid');
            }
        } catch (error) {
            console.error('KeyMoments: Error jumping to time', error);
        }
    }

    /**
     * Actualiza el estado basado en el tiempo del video (llamado desde loop externo)
     */
    update(data) {
        if (!data || data.currentTime === undefined) return;
        this.highlightCurrent(data.currentTime);
    }

    highlightCurrent(currentTime) {
        if (!this.element) return;

        const items = this.element.querySelectorAll('.moment-item');
        if (!items || items.length === 0) return;

        // Encontrar el último momento que ya pasó
        let activeIndex = -1;
        for (let i = 0; i < this.moments.length; i++) {
            const timeSeconds = this.parseTime(this.moments[i].tiempo);
            if (currentTime >= timeSeconds) {
                activeIndex = i;
            } else {
                break;
            }
        }

        items.forEach((item, index) => {
            if (index === activeIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    parseTime(timeStr) {
        try {
            if (typeof timeStr === 'number') return timeStr;
            if (!timeStr) return 0;

            // Si es un rango "2:58 - 3:47", tomar solo el inicio
            let cleanTime = timeStr.toString();
            if (cleanTime.includes('-')) {
                cleanTime = cleanTime.split('-')[0];
            }

            // Limpiar ceros o espacios y caracteres no numéricos excepto :
            cleanTime = cleanTime.replace(/[^\d:]/g, '');

            const parts = cleanTime.split(':');
            if (parts.length === 2) {
                const min = parseInt(parts[0]);
                const sec = parseInt(parts[1]);
                return (min * 60) + sec;
            }
            return parseFloat(cleanTime) || 0;
        } catch (e) {
            return 0;
        }
    }
}
