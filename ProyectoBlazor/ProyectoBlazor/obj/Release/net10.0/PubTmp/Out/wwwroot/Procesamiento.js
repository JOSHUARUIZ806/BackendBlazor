window.iniciarProcesamiento = function () {
  // Si este alumno ya terminó esta prueba, no puede volver a entrar.
  (function () {
    var P = 'velocidad';
    try {
      var id = localStorage.getItem('estudianteId');
      if (!id) return;
      var d = JSON.parse(localStorage.getItem('evaluacionCognitiva') || '{}');
      if ((d.resultados || []).some(function (r) { return r.estudiante_id === Number(id) && r.prueba === P; })) {
        location.replace('/Estudiante?completada=' + P);
      }
    } catch (e) {}
  })();

    /* ══════════════════════════════════════
       GAME ENGINE
    ══════════════════════════════════════ */
    const MIN_GAP = 12;        // px de separación mínima entre bordes de nodos

    /* ── Utilidad para barajar arreglos (Fisher-Yates) ── */
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    /* ── Definición de figuras para la Fase 2 ── */
    const FIGURAS_META = {
        cuadrado: {
            nombre: 'Cuadrado',
            iconoMini: '<svg viewBox="0 0 24 24" width="16" height="16"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor"/></svg>',
            svgNodo: '<svg viewBox="0 0 52 52"><rect class="shape-svg-path" x="6" y="6" width="40" height="40" rx="7"/></svg>'
        },
        triangulo: {
            nombre: 'Triángulo',
            iconoMini: '<svg viewBox="0 0 24 24" width="16" height="16"><polygon points="12,3 22,20 2,20" fill="currentColor"/></svg>',
            svgNodo: '<svg viewBox="0 0 52 52"><polygon class="shape-svg-path" points="26,5 48,45 4,45"/></svg>'
        },
        circulo: {
            nombre: 'Círculo',
            iconoMini: '<svg viewBox="0 0 24 24" width="16" height="16"><circle cx="12" cy="12" r="9" fill="currentColor"/></svg>',
            svgNodo: '<svg viewBox="0 0 52 52"><circle class="shape-svg-path" cx="26" cy="26" r="21"/></svg>'
        }
    };

    /* ── Definición de las 3 Fases ── */
    const LETRAS_15 = 'ABCDEFGHIJKLMNO'.split(''); // 15 letras (A..O)
    const NUMEROS_15 = Array.from({ length: 15 }, (_, i) => String(i + 1)); // 15 números (1..15)

    const NIVELES = [
        {
            tipo: 'numeros',
            nombre: 'Números (1–25)',
            total: 25
        },
        {
            tipo: 'figuras',
            nombre: 'Figuras (30)',
            total: 30
        },
        {
            tipo: 'alfanumerico',
            nombre: 'Números y Letras (30)',
            total: 30
        }
    ];

    const playArea = document.getElementById('playArea');
    const lineCanvas = document.getElementById('lineCanvas');
    const progressBar = document.getElementById('progressBar');
    const startOverlay = document.getElementById('startOverlay');
    const endOverlay = document.getElementById('endOverlay');
    const endTitle = document.getElementById('endTitle');
    const resultsDiv = document.getElementById('results');
    const levelVal = document.getElementById('levelVal');
    const statTarget = document.getElementById('statTarget');
    const targetVal = document.getElementById('targetVal');
    const targetPrompt = document.getElementById('targetPrompt');
    const targetPromptLabel = document.getElementById('targetPromptLabel');
    const targetPromptValue = document.getElementById('targetPromptValue');
    const hitsVal = document.getElementById('hitsVal');
    const errorsVal = document.getElementById('errorsVal');
    const timerVal = document.getElementById('timerVal');
    const statHits = document.getElementById('statHits');
    const statErrors = document.getElementById('statErrors');
    const btnStart = document.getElementById('btnStart');
    const btnNext = document.getElementById('btnNext');
    const btnReturnHome = document.getElementById('btnReturnHome');

    let circles = [];     // {el, x, y, index, valor, figura, done}
    let secuenciaOrden = [];     // objetivos esperados en cada paso (longitud = 25 o 30)
    let ultimoNodoConectado = null;
    let nivelActual = 0;
    let resultados = [];     // un objeto por fase terminada
    let nextExpected = 0;      // índice del paso actual (0 .. total-1)
    let hits = 0;
    let errors = 0;
    let visibleAt = null;   // instante en que los nodos quedan jugables
    let primerClicMs = null;   // latencia al primer clic (cualquier nodo)
    let primerClicCorrecto = false;
    let startTime = null;   // inicia al acertar el primer elemento de la fase
    let timerRAF = null;
    let gameActive = false;

    /* ── Circle radius in px ── */
    function getR() {
        return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--circle-r')) || 25;
    }

    /* ── Generate non-overlapping positions ── */
    function generatePositions(count, w, h, reserveTopBanner) {
        const r = getR();
        const pad = w < 500 ? 10 : 32;
        const topPad = reserveTopBanner ? Math.max(pad, 56) : pad;
        const positions = [];
        const maxTries = 2500;

        // Intentamos primero con MIN_GAP normal y si el área es pequeña reducimos ligeramente el gap
        for (let i = 0; i < count; i++) {
            let placed = false;
            for (const gap of [MIN_GAP, 8, 4]) {
                for (let t = 0; t < maxTries; t++) {
                    const x = pad + r + Math.random() * Math.max(10, w - 2 * (pad + r));
                    const y = topPad + r + Math.random() * Math.max(10, h - topPad - pad - 2 * r);
                    let ok = true;
                    for (const p of positions) {
                        const dx = x - p.x;
                        const dy = y - p.y;
                        if (Math.sqrt(dx * dx + dy * dy) < r * 2 + gap) {
                            ok = false;
                            break;
                        }
                    }
                    if (ok) {
                        positions.push({ x, y });
                        placed = true;
                        break;
                    }
                }
                if (placed) break;
            }
            if (!placed) {
                // Fallback: cuadrícula adaptativa
                const cols = Math.ceil(Math.sqrt(count * w / h));
                const rows = Math.ceil(count / cols);
                const row = Math.floor(i / cols);
                const col = i % cols;
                const gx = pad + r + col * ((w - 2 * (pad + r)) / Math.max(cols - 1, 1));
                const gy = topPad + r + row * ((h - topPad - pad - 2 * r) / Math.max(rows - 1, 1));
                positions.push({ x: gx, y: gy });
            }
        }
        return positions;
    }

    /* ── Actualiza el indicador de objetivo para Fase 2 y Fase 3 ── */
    function actualizarIndicadorObjetivo(conPulso) {
        const nivel = NIVELES[nivelActual];
        if (nivel.tipo === 'numeros' || nextExpected >= secuenciaOrden.length) {
            statTarget.hidden = true;
            targetPrompt.hidden = true;
            return;
        }

        const objetivo = secuenciaOrden[nextExpected];
        statTarget.hidden = false;
        targetPrompt.hidden = false;

        if (nivel.tipo === 'figuras') {
            const meta = FIGURAS_META[objetivo];
            targetPromptLabel.textContent = 'Conecta figura:';
            targetPromptValue.innerHTML = `${meta.iconoMini} <span>${meta.nombre}</span>`;
            targetVal.innerHTML = `${meta.iconoMini} <span>${meta.nombre}</span>`;
        } else if (nivel.tipo === 'alfanumerico') {
            const esNumero = /^[0-9]+$/.test(objetivo);
            const tipoTexto = esNumero ? 'Número' : 'Letra';
            targetPromptLabel.textContent = nextExpected === 0 ? 'Inicia en:' : 'Siguiente:';
            targetPromptValue.innerHTML = `<span>${tipoTexto} ${objetivo}</span>`;
            targetVal.textContent = `${tipoTexto} ${objetivo}`;
        }

        if (conPulso) {
            pulseStat(statTarget);
            targetPrompt.classList.remove('pulse');
            void targetPrompt.offsetWidth;
            targetPrompt.classList.add('pulse');
            setTimeout(() => targetPrompt.classList.remove('pulse'), 300);
        }
    }

    /* ── Construye los nodos de la fase actual ── */
    function buildCircles(nivel) {
        circles.forEach(c => c.el.remove());
        circles = [];
        secuenciaOrden = [];
        ultimoNodoConectado = null;
        lineCanvas.innerHTML = '';
        progressBar.style.width = '0%';

        const rect = playArea.getBoundingClientRect();
        const w = rect.width || 800;
        const h = rect.height || 500;
        const usaBanner = nivel.tipo !== 'numeros';
        const positions = generatePositions(nivel.total, w, h, usaBanner);

        if (nivel.tipo === 'numeros') {
            // Fase 1: Círculos con números del 1 al 25 en orden
            secuenciaOrden = Array.from({ length: 25 }, (_, i) => String(i + 1));
            secuenciaOrden.forEach((etiqueta, index) => {
                const el = document.createElement('div');
                el.className = 'circle';
                el.textContent = etiqueta;
                el.dataset.etiqueta = etiqueta;
                el.dataset.orden = index + 1;
                el.style.left = positions[index].x + 'px';
                el.style.top = positions[index].y + 'px';

                el.addEventListener('click', () => onCircleClick(index));
                playArea.appendChild(el);
                circles.push({ el, x: positions[index].x, y: positions[index].y, index, valor: etiqueta, done: false });
            });
        } else if (nivel.tipo === 'figuras') {
            // Fase 2: 30 figuras (10 cuadrados, 10 triángulos, 10 círculos)
            const poolFiguras = shuffle([
                ...Array(10).fill('cuadrado'),
                ...Array(10).fill('triangulo'),
                ...Array(10).fill('circulo')
            ]);
            // Orden aleatorio en que el programa pedirá conectar las figuras (30 pasos, 10 de cada una)
            secuenciaOrden = shuffle([...poolFiguras]);

            poolFiguras.forEach((figura, index) => {
                const el = document.createElement('div');
                el.className = `circle shape-node shape-${figura}`;
                el.innerHTML = FIGURAS_META[figura].svgNodo;
                el.dataset.figura = figura;
                el.style.left = positions[index].x + 'px';
                el.style.top = positions[index].y + 'px';

                el.addEventListener('click', () => onCircleClick(index));
                playArea.appendChild(el);
                circles.push({ el, x: positions[index].x, y: positions[index].y, index, valor: figura, figura, done: false });
            });
        } else if (nivel.tipo === 'alfanumerico') {
            // Fase 3: 15 números (1..15) y 15 letras (A..O).
            // Empieza en un número y después de seleccionarlo el sistema enseña qué número o letra sigue al azar.
            const numerosBarajados = shuffle([...NUMEROS_15]);
            const primerNumero = numerosBarajados[0];
            const restoObjetivos = shuffle([...numerosBarajados.slice(1), ...LETRAS_15]);
            secuenciaOrden = [primerNumero, ...restoObjetivos];

            // Colocamos los 30 círculos en posiciones aleatorias
            const nodosTablero = shuffle([...NUMEROS_15, ...LETRAS_15]);
            nodosTablero.forEach((etiqueta, index) => {
                const el = document.createElement('div');
                el.className = 'circle';
                el.textContent = etiqueta;
                el.dataset.etiqueta = etiqueta;
                el.style.left = positions[index].x + 'px';
                el.style.top = positions[index].y + 'px';

                el.addEventListener('click', () => onCircleClick(index));
                playArea.appendChild(el);
                circles.push({ el, x: positions[index].x, y: positions[index].y, index, valor: etiqueta, done: false });
            });
        }
    }

    /* ── Muestra todos los elementos con escalonado ── */
    function revealAllCircles() {
        const nivel = NIVELES[nivelActual];
        circles.forEach((c, i) => {
            setTimeout(() => c.el.classList.add('visible'), i * 25);
        });

        if (nivel.tipo === 'numeros') {
            circles[0].el.classList.add('first-visible');
        } else if (nivel.tipo === 'alfanumerico') {
            // Resaltamos el primer número para que el usuario lo identifique de inmediato al iniciar
            const primero = circles.find(c => c.valor === secuenciaOrden[0]);
            if (primero) primero.el.classList.add('first-visible');
        }
    }

    /* ── Draw line between two nodes ── */
    function drawLine(from, to) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.x);
        line.setAttribute('y1', from.y);
        line.setAttribute('x2', to.x);
        line.setAttribute('y2', to.y);
        line.classList.add('line-animate');
        lineCanvas.appendChild(line);
    }

    /* ── Timer display ── */
    function formatTime(ms) {
        const totalSec = ms / 1000;
        const min = Math.floor(totalSec / 60);
        const sec = Math.floor(totalSec % 60);
        const dec = Math.floor((totalSec % 1) * 10);
        return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${dec}`;
    }

    function updateTimer() {
        if (startTime === null || !gameActive) return;
        timerVal.textContent = formatTime(performance.now() - startTime);
        timerRAF = requestAnimationFrame(updateTimer);
    }

    /* ── Pulse stat chip ── */
    function pulseStat(el) {
        el.classList.add('pulse');
        setTimeout(() => el.classList.remove('pulse'), 400);
    }

    /* ── Click handler para las 3 fases ── */
    function onCircleClick(index) {
        if (!gameActive) return;

        const circle = circles[index];
        if (!circle || circle.done || circle.el.classList.contains('done')) return;

        const esperado = secuenciaOrden[nextExpected];
        const esCorrecto = circle.valor === esperado;

        // Latencia al primer clic: el primero sobre cualquier elemento, acierte o no
        if (primerClicMs === null) {
            primerClicMs = Math.round(performance.now() - visibleAt);
            primerClicCorrecto = esCorrecto;
        }

        if (esCorrecto) {
            hits++;
            hitsVal.textContent = hits;
            pulseStat(statHits);

            // El cronómetro de la fase inicia al acertar el primer elemento
            if (nextExpected === 0) {
                startTime = performance.now();
                updateTimer();
            }

            circle.done = true;
            circle.el.classList.remove('first-visible');
            circle.el.classList.add('done');

            if (ultimoNodoConectado !== null) {
                drawLine(ultimoNodoConectado, circle);
            }
            ultimoNodoConectado = circle;

            progressBar.style.width = ((hits / circles.length) * 100) + '%';

            nextExpected++;

            if (nextExpected >= circles.length) {
                actualizarIndicadorObjetivo(false);
                endLevel();
            } else {
                actualizarIndicadorObjetivo(true);
            }
        } else {
            // Error
            errors++;
            errorsVal.textContent = errors;
            pulseStat(statErrors);

            circle.el.classList.add('error-flash');
            setTimeout(() => circle.el.classList.remove('error-flash'), 500);
        }
    }

    /* ── Inicia una fase: reinicia contadores, distribuye nodos y los revela ── */
    function iniciarNivel(indice) {
        const nivel = NIVELES[indice];
        nivelActual = indice;
        nextExpected = 0;
        hits = 0;
        errors = 0;
        startTime = null;
        primerClicMs = null;
        primerClicCorrecto = false;

        levelVal.textContent = `${indice + 1}/${NIVELES.length} · ${nivel.nombre}`;
        hitsVal.textContent = '0';
        errorsVal.textContent = '0';
        timerVal.textContent = '00:00.0';
        endOverlay.classList.add('hidden');

        buildCircles(nivel);
        actualizarIndicadorObjetivo(false);
        revealAllCircles();
        visibleAt = performance.now();
        gameActive = true;
    }

    /* ── Puntaje de una fase (0-100) ── */
    const SEG_RAPIDO = 1.5;
    const SEG_LENTO = 5;
    function precisionNivel(aciertos, errores) {
        return Math.round((aciertos / (aciertos + errores)) * 100);
    }
    function rapidezNivel(tiempoMs, totalElementos) {
        const segPorElemento = tiempoMs / 1000 / totalElementos;
        const r = (SEG_LENTO - segPorElemento) / (SEG_LENTO - SEG_RAPIDO);
        return Math.round(Math.max(0, Math.min(1, r)) * 100);
    }
    function puntajeNivel(aciertos, errores, tiempoMs) {
        return Math.round(0.6 * precisionNivel(aciertos, errores) + 0.4 * rapidezNivel(tiempoMs, aciertos));
    }

    /* ── Fin de fase: guarda resultados y muestra el resumen ── */
    function endLevel() {
        gameActive = false;
        cancelAnimationFrame(timerRAF);

        const nivel = NIVELES[nivelActual];
        const tiempoMs = Math.round(performance.now() - startTime);
        timerVal.textContent = formatTime(tiempoMs);

        const totalFase = nivel.total;
        const res = {
            nivel: nivelActual + 1,
            tipo: nivel.tipo,
            tiempoMs,
            errores: errors,
            primerClicMs,
            primerClicCorrecto,
            precision: precisionNivel(totalFase, errors),
            rapidez: rapidezNivel(tiempoMs, totalFase),
            puntaje: puntajeNivel(totalFase, errors, tiempoMs)
        };
        resultados.push(res);

        const esUltimo = nivelActual === NIVELES.length - 1;
        if (esUltimo) {
            mostrarResumenFinal();
        } else {
            endTitle.textContent = `Fase ${res.nivel} completada`;
            resultsDiv.innerHTML =
                filaResultado('✅ Aciertos', totalFase, 'green') +
                filaResultado('❌ Errores', res.errores, 'red') +
                filaResultado('⏱️ Tiempo de la fase', formatTime(res.tiempoMs), 'yellow') +
                filaResultado('🎯 Precisión', res.precision + '%', 'green') +
                filaResultado('🚀 Rapidez', res.rapidez + '%', 'green') +
                filaResultado('⚡ Tiempo de reacción al primer clic', formatSegundos(res.primerClicMs), 'yellow');
            btnNext.hidden = false;
            btnReturnHome.hidden = true;
            setTimeout(() => {
                endOverlay.classList.remove('hidden');
                launchConfetti();
            }, 500);
        }
    }

    /* ── Resumen final de las 3 fases + envío al servidor ── */
    function mostrarResumenFinal() {
        const aciertosTotal = NIVELES.reduce((sum, n) => sum + n.total, 0);
        const erroresTotal = resultados.reduce((sum, r) => sum + r.errores, 0);
        const tiempoMs = resultados.reduce((sum, r) => sum + r.tiempoMs, 0);
        const primerClicMsPromedio = Math.round(
            resultados.reduce((sum, r) => sum + r.primerClicMs, 0) / resultados.length);
        const precisionPct = Math.round((aciertosTotal / (aciertosTotal + erroresTotal)) * 100);
        const puntaje = Math.round(resultados.reduce((sum, r) => sum + r.puntaje, 0) / resultados.length);

        endTitle.textContent = '🏆 ¡Prueba completada!';
        resultsDiv.innerHTML =
            filaResultado('✅ Aciertos totales', aciertosTotal, 'green') +
            filaResultado('❌ Errores totales', erroresTotal, 'red') +
            filaResultado('⏱️ Tiempo total', formatTime(tiempoMs), 'yellow') +
            filaResultado('🎯 Precisión', precisionPct + '%', 'green') +
            filaResultado('⚡ Tiempo de reacción al primer clic (promedio)', formatSegundos(primerClicMsPromedio), 'yellow') +
            filaResultado('⭐ Puntaje', puntaje + '/100', 'green');
        btnNext.hidden = true;
        btnReturnHome.hidden = false;

        setTimeout(() => {
            endOverlay.classList.remove('hidden');
            launchConfetti();
        }, 500);

        enviarResultadoAlServidor({
            prueba: 'velocidad',
            puntaje,
            precisionPct,
            tiempoMs,
            errores: erroresTotal,
            detalle: { primerClicMsPromedio, niveles: resultados }
        });
    }

    /* ── Utilidades de presentación ── */
    function filaResultado(etiqueta, valor, color) {
        return `<div class="result-row"><span class="r-label">${etiqueta}</span><span class="r-value ${color}">${valor}</span></div>`;
    }

    function formatSegundos(ms) {
        return (ms / 1000).toFixed(2) + ' s';
    }

    /* ── Envío de resultados al backend (SQL Server) ── */
    function enviarResultadoAlServidor(datos) {
        const estudianteId = localStorage.getItem('estudianteId');
        if (!estudianteId) return;
        fetch('/api/resultados', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                estudianteId: Number(estudianteId),
                prueba: datos.prueba,
                puntaje: Number(datos.puntaje) || 0,
                precisionPct: Number(datos.precisionPct) || 0,
                tiempoMs: Number(datos.tiempoMs) || 0,
                errores: Number(datos.errores) || 0,
                detalle: datos.detalle || null
            })
        }).catch(() => {});
    }

    /* ── Confetti ── */
    function launchConfetti() {
        const canvas = document.getElementById('confetti');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#a78bfa', '#f87171'];
        const pieces = [];

        for (let i = 0; i < 120; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * -canvas.height,
                w: 6 + Math.random() * 6,
                h: 4 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                vy: 2 + Math.random() * 4,
                vx: (Math.random() - 0.5) * 3,
                rot: Math.random() * Math.PI * 2,
                vr: (Math.random() - 0.5) * 0.15,
                opacity: 1,
            });
        }

        let frame = 0;
        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            let alive = false;
            for (const p of pieces) {
                if (p.opacity <= 0) continue;
                alive = true;
                p.x += p.vx;
                p.y += p.vy;
                p.rot += p.vr;
                p.vy += 0.05;
                if (p.y > canvas.height * 0.8) p.opacity -= 0.02;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.opacity);
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rot);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            }
            frame++;
            if (alive && frame < 300) requestAnimationFrame(draw);
            else ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        draw();
    }

    /* ── Event bindings ── */
    btnStart.addEventListener('click', () => {
        startOverlay.classList.add('hidden');
        iniciarNivel(0);
    });
    btnNext.addEventListener('click', () => iniciarNivel(nivelActual + 1));

    /* ── Init: la portada se muestra hasta que el alumno pulse "Iniciar Prueba" ── */
    levelVal.textContent = `1/${NIVELES.length} · ${NIVELES[0].nombre}`;
};

