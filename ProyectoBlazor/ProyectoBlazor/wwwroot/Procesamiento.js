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
  const MIN_GAP = 14;        // px de separación entre bordes de círculos

  const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXY'.split(''); // A→Y (25 letras, sin Ñ)
  const NIVELES = [
    { tipo: 'numeros',   nombre: 'Números',
      etiquetas: Array.from({ length: 25 }, (_, i) => String(i + 1)) },
    { tipo: 'letras',    nombre: 'Letras',
      etiquetas: ALFABETO },
    { tipo: 'alternado', nombre: 'Números y letras',
      etiquetas: Array.from({ length: 10 }, (_, i) => [String(i + 1), ALFABETO[i]]).flat() },
    { tipo: 'fonemas',   nombre: 'Fonemas R, M, N', mostrarOrden: true,
      etiquetas: Array.from({ length: 18 }, (_, i) => 'RMN'[i % 3]) }
  ];

  const playArea      = document.getElementById('playArea');
  const lineCanvas    = document.getElementById('lineCanvas');
  const progressBar   = document.getElementById('progressBar');
  const startOverlay  = document.getElementById('startOverlay');
  const endOverlay    = document.getElementById('endOverlay');
  const endTitle      = document.getElementById('endTitle');
  const resultsDiv    = document.getElementById('results');
  const levelVal      = document.getElementById('levelVal');
  const hitsVal       = document.getElementById('hitsVal');
  const errorsVal     = document.getElementById('errorsVal');
  const timerVal      = document.getElementById('timerVal');
  const statHits      = document.getElementById('statHits');
  const statErrors    = document.getElementById('statErrors');
  const btnStart      = document.getElementById('btnStart');
  const btnNext       = document.getElementById('btnNext');
  const btnReturnHome = document.getElementById('btnReturnHome');

  let circles      = [];
  let nivelActual  = 0;
  let resultados   = [];
  let nextExpected = 0;
  let hits         = 0;
  let errors       = 0;
  let visibleAt    = null;
  let primerClicMs = null;
  let primerClicCorrecto = false;
  let startTime    = null;
  let timerRAF     = null;
  let gameActive   = false;

  function getR() {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--circle-r')) || 26;
  }

  function generatePositions(count, w, h) {
    const r = getR();
    const pad = w < 500 ? 10 : 36;
    const positions = [];
    const maxTries  = 2000;

    for (let i = 0; i < count; i++) {
      let placed = false;
      for (let t = 0; t < maxTries; t++) {
        const x = pad + r + Math.random() * (w - 2 * (pad + r));
        const y = pad + r + Math.random() * (h - 2 * (pad + r));
        let ok = true;
        for (const p of positions) {
          const dx = x - p.x;
          const dy = y - p.y;
          if (Math.sqrt(dx * dx + dy * dy) < r * 2 + MIN_GAP) {
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
      if (!placed) {
        const cols = Math.ceil(Math.sqrt(count * w / h));
        const rows = Math.ceil(count / cols);
        const row  = Math.floor(i / cols);
        const col  = i % cols;
        const gx   = pad + r + col * ((w - 2 * (pad + r)) / Math.max(cols - 1, 1));
        const gy   = pad + r + row * ((h - 2 * (pad + r)) / Math.max(rows - 1, 1));
        positions.push({ x: gx, y: gy });
      }
    }
    return positions;
  }

  function buildCircles(nivel) {
    circles.forEach(c => c.el.remove());
    circles = [];
    lineCanvas.innerHTML = '';
    progressBar.style.width = '0%';

    const rect = playArea.getBoundingClientRect();
    const positions = generatePositions(nivel.etiquetas.length, rect.width, rect.height);

    nivel.etiquetas.forEach((etiqueta, orden) => {
      const el = document.createElement('div');
      el.className = 'circle' + (nivel.mostrarOrden ? ' fonema' : '');
      el.textContent = etiqueta;
      el.dataset.etiqueta = etiqueta;
      el.dataset.orden = orden + 1;
      el.style.left = positions[orden].x + 'px';
      el.style.top  = positions[orden].y + 'px';

      if (nivel.mostrarOrden) {
        const badge = document.createElement('span');
        badge.className = 'orden';
        badge.textContent = orden + 1;
        el.appendChild(badge);
      }

      el.addEventListener('click', () => onCircleClick(orden));

      playArea.appendChild(el);
      circles.push({ el, x: positions[orden].x, y: positions[orden].y, orden });
    });
  }

  function revealAllCircles() {
    circles.forEach((c, i) => {
      setTimeout(() => c.el.classList.add('visible'), i * 30);
    });
    circles[0].el.classList.add('first-visible');
  }

  function drawLine(from, to) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', to.x);
    line.setAttribute('y2', to.y);
    line.classList.add('line-animate');
    lineCanvas.appendChild(line);
  }

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

  function pulseStat(el) {
    el.classList.add('pulse');
    setTimeout(() => el.classList.remove('pulse'), 400);
  }

  function onCircleClick(orden) {
    if (!gameActive) return;

    const circle = circles[orden];
    if (circle.el.classList.contains('done')) return;

    if (primerClicMs === null) {
      primerClicMs = Math.round(performance.now() - visibleAt);
      primerClicCorrecto = orden === nextExpected;
    }

    if (orden === nextExpected) {
      hits++;
      hitsVal.textContent = hits;
      pulseStat(statHits);

      if (orden === 0) {
        startTime = performance.now();
        updateTimer();
      }

      circle.el.classList.remove('first-visible');
      circle.el.classList.add('done');

      if (orden > 0) drawLine(circles[orden - 1], circle);

      progressBar.style.width = ((hits / circles.length) * 100) + '%';

      nextExpected++;

      if (nextExpected >= circles.length) {
        endLevel();
      }
    } else {
      errors++;
      errorsVal.textContent = errors;
      pulseStat(statErrors);

      circle.el.classList.add('error-flash');
      setTimeout(() => circle.el.classList.remove('error-flash'), 500);
    }
  }

  function iniciarNivel(indice) {
    const nivel = NIVELES[indice];
    nivelActual  = indice;
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
    revealAllCircles();
    visibleAt = performance.now();
    gameActive = true;
  }

  const SEG_RAPIDO = 1.5;
  const SEG_LENTO  = 5;
  function precisionNivel(aciertos, errores) {
    return Math.round((aciertos / (aciertos + errores)) * 100);
  }
  function rapidezNivel(tiempoMs, circulos) {
    const segPorCirculo = tiempoMs / 1000 / circulos;
    const r = (SEG_LENTO - segPorCirculo) / (SEG_LENTO - SEG_RAPIDO);
    return Math.round(Math.max(0, Math.min(1, r)) * 100);
  }
  function puntajeNivel(aciertos, errores, tiempoMs) {
    return Math.round(0.6 * precisionNivel(aciertos, errores) + 0.4 * rapidezNivel(tiempoMs, aciertos));
  }

  function endLevel() {
    gameActive = false;
    cancelAnimationFrame(timerRAF);

    const nivel = NIVELES[nivelActual];
    const tiempoMs = Math.round(performance.now() - startTime);
    timerVal.textContent = formatTime(tiempoMs);

    const res = {
      nivel: nivelActual + 1,
      tipo: nivel.tipo,
      tiempoMs,
      errores: errors,
      primerClicMs,
      primerClicCorrecto,
      precision: precisionNivel(nivel.etiquetas.length, errors),
      rapidez: rapidezNivel(tiempoMs, nivel.etiquetas.length),
      puntaje: puntajeNivel(nivel.etiquetas.length, errors, tiempoMs)
    };
    resultados.push(res);

    const esUltimo = nivelActual === NIVELES.length - 1;
    if (esUltimo) {
      mostrarResumenFinal();
    } else {
      endTitle.textContent = `Nivel ${res.nivel} completado`;
      resultsDiv.innerHTML =
        filaResultado('✅ Aciertos', nivel.etiquetas.length, 'green') +
        filaResultado('❌ Errores', res.errores, 'red') +
        filaResultado('⏱️ Tiempo del nivel', formatTime(res.tiempoMs), 'yellow') +
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

  function mostrarResumenFinal() {
    const aciertosTotal = NIVELES.reduce((sum, n) => sum + n.etiquetas.length, 0);
    const erroresTotal  = resultados.reduce((sum, r) => sum + r.errores, 0);
    const tiempoMs      = resultados.reduce((sum, r) => sum + r.tiempoMs, 0);
    const primerClicMsPromedio = Math.round(
      resultados.reduce((sum, r) => sum + r.primerClicMs, 0) / resultados.length);
    const precisionPct = Math.round((aciertosTotal / (aciertosTotal + erroresTotal)) * 100);
    const puntaje = Math.round(resultados.reduce((sum, r) => sum + r.puntaje, 0) / resultados.length);

    endTitle.textContent = '🏆 ¡Prueba completada!';
    resultsDiv.innerHTML =
      filaResultado('✅ Aciertos', aciertosTotal, 'green') +
      filaResultado('❌ Errores', erroresTotal, 'red') +
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

  function filaResultado(etiqueta, valor, color) {
    return `<div class="result-row"><span class="r-label">${etiqueta}</span><span class="r-value ${color}">${valor}</span></div>`;
  }

  function formatSegundos(ms) {
    return (ms / 1000).toFixed(2) + ' s';
  }

  function enviarResultadoAlServidor(datos) {
    const estudianteId = localStorage.getItem('estudianteId');
    if (!estudianteId) return;
    try {
      const db = JSON.parse(localStorage.getItem('evaluacionCognitiva') || '{}');
      db.grupos = db.grupos || []; db.estudiantes = db.estudiantes || []; db.resultados = db.resultados || [];
      db.sig = db.sig || { g: 1, e: 1, r: 1 };
      const id = Number(estudianteId);
      if (db.resultados.some((r) => r.estudiante_id === id && r.prueba === datos.prueba)) return;
      const n = (x) => (isFinite(Number(x)) ? Number(x) : 0);
      db.resultados.push({
        id: db.sig.r++, estudiante_id: id, prueba: datos.prueba, puntaje: n(datos.puntaje),
        precision_pct: n(datos.precisionPct), tiempo_ms: n(datos.tiempoMs), errores: n(datos.errores),
        detalle_json: datos.detalle ? JSON.stringify(datos.detalle) : null, creado_en: new Date().toISOString()
      });
      localStorage.setItem('evaluacionCognitiva', JSON.stringify(db));
    } catch (e) {}
  }

  function launchConfetti() {
    const canvas = document.getElementById('confetti');
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
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

  btnStart.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    iniciarNivel(0);
  });
  btnNext.addEventListener('click', () => iniciarNivel(nivelActual + 1));

  levelVal.textContent = `1/${NIVELES.length} · ${NIVELES[0].nombre}`;
};

