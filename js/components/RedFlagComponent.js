// Configuration Toggle
const ENABLE_PSYCHOLOGICAL_ANALYSIS = true;

/**
 * RedFlagComponent - Muestra badges de momentos críticos
 * 
 * Overlay que aparece cuando hay un momento crítico detectado.
 * Versión minimalista integrada en video.
 */
class RedFlagComponent extends BaseIndicator {
    constructor(elementId) {
        super({
            elementId: elementId,
            name: 'RedFlagComponent',
            debug: true,
            displayDuration: 5000  // 5 segundos visible
        });

        this.criticalMoments = [];
        this.activeFlag = null;
        this.hideTimeout = null;
        this.shownHistory = new Set(); // Historial para evitar rebotes
    }

    /**
     * Cargar momentos críticos
     */
    loadCriticalMoments(moments) {
        this.criticalMoments = moments || [];
        this.shownHistory.clear(); // Limpiar historial al cargar nuevos datos
        this.log(`Loaded ${this.criticalMoments.length} critical moments`);
    }

    /**
     * Validar datos
     */
    validate(data) {
        if (!super.validate(data)) return false;

        if (typeof data.currentTime !== 'number') {
            this.log('Invalid currentTime', 'warn');
            return false;
        }

        return true;
    }

    /**
     * Actualizar con tiempo actual
     */
    render(data) {
        const { currentTime } = data;

        // DETECTAR SEEK (Salto de tiempo > 1.5s): Limpiar historial para permitir que reaparezcan eventos
        if (this.lastRenderTime !== undefined && Math.abs(currentTime - this.lastRenderTime) > 1.5) {
            // Usuario saltó en el video: Resetear memoria de lo visto
            this.shownHistory.clear();
            // También ocultar cualquier flag activo para limpiar la pantalla
            if (this.activeFlag) this.hide();
        }
        this.lastRenderTime = currentTime;

        // FIX: Manejar solapamientos (ej. evento corto 3:31 dentro de evento largo 2:58-3:47)
        // Encontrar TODOS los posibles momentos activos
        const potentialMoments = this.criticalMoments.filter(m => {
            // Check feature toggle for psychological patterns
            if (m.tipo_indicador === 'PATRON_PSICOLOGICO' && !ENABLE_PSYCHOLOGICAL_ANALYSIS) {
                return false;
            }

            let start = m.segundos_inicio;
            let end = m.segundos_fin;

            // Si dura menos de 1.5s, expandir la ventana de detección
            if ((end - start) < 1.5) {
                end = start + 2.0;
            }

            return currentTime >= start && currentTime <= end;
        });

        // Si hay varios, elegir el de menor duración (el más específico)
        let activeMoment = null;
        if (potentialMoments.length > 0) {
            // Prioridad especial: Patrones psicológicos sobre otros si coinciden
            /* 
               Si queremos que los psicológicos tengan prioridad, descomentar esto.
               Por ahora mantenemos la lógica de "el más corto manda" para precisión temporal.
               
               Si ambos tienen duración similar, podríamos priorizar el psicológico.
            */
            activeMoment = potentialMoments.sort((a, b) => {
                // Si uno es psicológico y el otro no, y duran parecido...
                // Por simplicidad, mantenemos duración.
                const durA = (a.segundos_fin - a.segundos_inicio) || 0;
                const durB = (b.segundos_fin - b.segundos_inicio) || 0;
                return durA - durB; // Ascendente: menor duración primero
            })[0];
        }

        // UX FIX: Evitar "rebote" (que el evento largo reaparezca después del corto)
        if (activeMoment) {
            // Generar ID único para rastreo
            const uniqueId = (activeMoment.timestamp || '') + (activeMoment.descripcion || activeMoment.analisis_integrado || '');

            // Caso 1: Es el mismo que ya está activo -> No hacer nada (mantener visible)
            if (this.activeFlag === activeMoment) {
                return;
            }

            // Caso 2: Es nuevo (o vuelve a ser activo). Verificar si YA SE MOSTRÓ antes.
            // Si ya se mostró y estamos volviendo a él (después de una interrupción), NO mostrarlo de nuevo.
            if (this.shownHistory.has(uniqueId)) {
                // Ya fue visto por el usuario. No repetir.
                return;
            }
        }

        // Lógica de transición
        if (activeMoment && this.activeFlag !== activeMoment) {
            // Mostrar nuevo flag
            this.showFlag(activeMoment);
            this.activeFlag = activeMoment;

            // Marcar como visto
            const uniqueId = (activeMoment.timestamp || '') + (activeMoment.descripcion || activeMoment.analisis_integrado || '');
            this.shownHistory.add(uniqueId);

        } else if (!activeMoment && this.activeFlag) {
            // Ya no estamos en momento crítico, ocultar
            this.hide();
        }
    }

    /**
     * Mostrar badge de red flag
     */
    showFlag(moment) {
        const isPsych = moment.tipo_indicador === 'PATRON_PSICOLOGICO';
        const typeColor = this.getTypeColor(moment.tipo_indicador);

        // MOVER AL CONTENEDOR DE VIDEO EXISTENTE
        // Buscar el wrapper del video para inyectar ahí
        const wrapper = document.querySelector('.video-overlay-wrapper');

        // Crear elemento si no existe o usar this.element
        if (wrapper && this.element.parentNode !== wrapper) {
            wrapper.appendChild(this.element);
            this.element.style.position = 'absolute';
            this.element.style.bottom = '80px'; // Subir más (antes 40px)
            this.element.style.left = '20px';   // Pegado a la izquierda (margen 20px)
            this.element.style.right = '20px';  // Ocupar todo el ancho disponible menos margen
            this.element.style.width = 'auto';
            this.element.style.pointerEvents = 'none';
            this.element.style.zIndex = '20';
            this.element.style.transform = 'none'; // Quitar centrado
        }

        const desc = this.formatDescription(moment.analisis_integrado || moment.que_dijo, moment.nivel_importancia, moment.tipo_indicador);

        // Estilo de fondo: Azul para psicológico, Gradiente oscuro para standard
        const backgroundStyle = isPsych
            ? 'linear-gradient(90deg, rgba(30, 64, 175, 0.9) 0%, rgba(59, 130, 246, 0.5) 100%)' // Azul Profundo
            : 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0) 100%)';

        this.element.innerHTML = `
            <div class="minimal-overlay-badge" style="
                background: ${backgroundStyle};
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                padding: 10px 20px;
                border-radius: 4px;
                color: #fff;
                font-family: 'Inter', sans-serif;
                font-size: 18px;
                font-weight: 700;
                line-height: 1.4;
                text-align: left;
                animation: fadeInOut 0.3s ease-out;
                width: 100%;
                white-space: normal;
                letter-spacing: 0.5px;
                border-left: ${isPsych ? '4px solid #60a5fa' : 'none'};
            ">
                <span style="color: ${typeColor}; margin-right: 12px; font-size: 24px;">${isPsych ? '🧠' : '●'}</span>${desc}
            </div>
            <style>
                @keyframes fadeInOut {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            </style>
        `;

        this.log(`Showing flag: ${moment.tipo_indicador}`);

        // Auto-ocultar después de 5 segundos
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => this.hide(), 5000);
    }

    /**
     * Ocultar badge
     */
    hide() {
        this.element.innerHTML = '';
        this.activeFlag = null;
    }

    /**
     * Formatear descripción con iconos y estilo
     */
    formatDescription(text, importance, type) {
        if (!text) return "Análisis no disponible";
        if (text.includes('<b>')) return text;

        let desc = text;

        if (type === 'PATRON_PSICOLOGICO') {
            // Formato especial para patrones
            if (desc.includes('Racionalización')) return `<b>Racionalización:</b> ${desc.replace('Racionalización', '')}`;
            if (desc.includes('Minimización')) return `<b>Minimización:</b> ${desc.replace('Minimización', '')}`;
            return `<b>Patrón Psicológico:</b> ${desc}`;
        }

        if (desc.includes('inestable')) desc = "⚠️ <b>Voz inestable</b> " + desc.replace('voz inestable', '');
        else if (desc.includes('temblor')) desc = "⚠️ <b>Temblor en la voz</b> " + desc.replace('temblor en la voz', '');
        else if (desc.includes('tensa')) desc = "🚨 <b>Estrés cognitivo:</b> " + desc;
        else if (importance === 'ALTO') desc = "🚨 " + desc;
        else desc = "ℹ️ " + desc;

        return desc;
    }

    /**
     * Obtener color según tipo de indicador
     */
    getTypeColor(type) {
        const colors = {
            'CAMBIO_EMOCIONAL': '#f59e0b',
            'ESTRES_COGNITIVO': '#ef4444',
            'INCONSISTENCIA': '#8b5cf6',
            'CONTRADICCION': '#ec4899',
            'PATRON_PSICOLOGICO': '#60a5fa' // Azul claro
        };
        return colors[type] || '#3b82f6';
    }

    /**
     * Obtener color según importancia
     */
    getImportanceColor(importance) {
        const colors = {
            'BAJO': '#22c55e',
            'MEDIO': '#eab308',
            'ALTO': '#ef4444'
        };
        return colors[importance] || '#3b82f6';
    }

    // ... helpers ...
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    truncate(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RedFlagComponent;
}
