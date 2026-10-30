/* ═══════════════════════════════════════════════════════
   MEMORAMA POR FASES — Lógica del juego
   4 fases (4x4, 6x6, 8x8, 10x10) × 2 tableros por fase.
   Cada tablero tiene un límite de errores (mitad de sus pares);
   al alcanzarlo la prueba termina.
   ═══════════════════════════════════════════════════════ */

window.iniciarMemorama = function () {


  // ─── Emojis (50 distintos: lo que exige el tablero de 10x10) ───
  const CARD_EMOJIS = [
    '🦊', '🐉', '🦄', '🐬', '🦅', '🐙', '🌸', '🌊', '🔥', '🌙',
    '⚡', '🌈', '🎸', '🎨', '🎭', '🧩', '🚀', '💎', '🍎', '🍌',
    '🍇', '🍉', '🍓', '🍒', '🍍', '🥑', '🌽', '🍕', '🍔', '🍩',
    '🐢', '🐸', '🦁', '🐼', '🐧', '🦉', '🐝', '🦋', '🐞', '⚽',
    '🏀', '🎲', '🎯', '🎺', '🎻', '🚲', '🏠', '⏰', '🔑', '📚'
  ];

  // ─── Configuración de fases ─────────────────────────
  // lado: casillas por lado; memorizar: segundos que se muestran las cartas.
  const FASES = [
    { lado: 4, memorizar: 10 },
    { lado: 6, memorizar: 10 },
    { lado: 8, memorizar: 10 },
    { lado: 10, memorizar: 10 }
  ].map(f => {
    const pares = (f.lado * f.lado) / 2;
    return {
      ...f,
      tamano: `${f.lado}x${f.lado}`,
      pares,                                   // pares por tablero
      limiteErrores: pares     // errores permitidos por tablero
    };
  });
  const TABLEROS_POR_FASE = 2;

  // ─── DOM Elements ───────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const board = $('#gameBoard');
  const timerDisplay = $('#timerDisplay');
  const matchesDisplay = $('#matchesDisplay');
  const errorsDisplay = $('#errorsDisplay');
  const progFase = $('#progFase');
  const progTablero = $('#progTablero');
  const progErrores = $('#progErrores');
  const phaseOverlay = $('#phaseOverlay');
  const countdownEl = $('#countdown');
  const startScreen = $('#startScreen');
  const btnStart = $('#btnStart');
  const transitionModal = $('#transitionModal');
  const btnContinue = $('#btnContinue');
  const resultModal = $('#resultModal');
  const errorPanelBody = $('#errorPanelBody');

  // ─── Estado del juego ───────────────────────────────
  let faseIdx = 0;          // fase actual (0-3)
  let tableroIdx = 0;       // tablero actual dentro de la fase (0-1)
  let cards = [];
  let flippedCards = [];
  let matchedPairs = 0;     // pares encontrados en el tablero actual
  let errors = 0;           // errores del tablero actual
  let isLocked = false;     // evita clics durante animaciones
  let isGameActive = false;

  // Tiempo de juego: solo cuenta mientras se resuelve un tablero
  // (no cuenta la memorización ni las pantallas de transición).
  let tiempoAcumuladoMs = 0;   // tableros ya terminados
  let inicioTableroMs = null;  // instante en que se destapó el tablero actual
  let timerInterval = null;

  // Resultados por fase/tablero, se llenan al terminar cada tablero
  let resultados = [];

  // Errores por carta (índice → veces) para el panel de errores repetidos
  let cardErrorMap = {};

  // ─── Particles ──────────────────────────────────────
  function createParticles() {
    const container = $('#particles');
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = Math.random() * 10 + 's';
      p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
      container.appendChild(p);
    }
  }

  // ─── Shuffle (Fisher-Yates) ─────────────────────────
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ─── Utilidades de estado ───────────────────────────
  function crearResultadosVacios() {
    return FASES.map(f => ({
      tamano: f.tamano,
      paresTotales: f.pares * TABLEROS_POR_FASE,
      paresEncontrados: 0,
      errores: 0,
      limiteErroresPorTablero: f.limiteErrores,
      tableros: Array.from({ length: TABLEROS_POR_FASE }, () => ({
        paresEncontrados: 0,
        paresTotales: f.pares,
        errores: 0,
        completado: false,
        jugado: false
      }))
    }));
  }

  function tiempoJugadoMs() {
    return tiempoAcumuladoMs + (inicioTableroMs !== null ? Date.now() - inicioTableroMs : 0);
  }

  // ─── Crear el tablero actual ────────────────────────
  function createBoard() {
    const fase = FASES[faseIdx];
    board.innerHTML = '';
    board.style.setProperty('--n', fase.lado);
    // Pares al azar de la lista de 50 emojis, duplicados y barajados
    const elegidos = shuffle(CARD_EMOJIS).slice(0, fase.pares);
    const emojiDeck = shuffle([...elegidos, ...elegidos]);
    cards = [];

    emojiDeck.forEach((emoji, index) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.dataset.index = index;
      card.dataset.emoji = emoji;

      card.innerHTML = `
        <div class="card-face card-back"></div>
        <div class="card-face card-front">${emoji}</div>
      `;

      card.addEventListener('click', () => onCardClick(card));
      board.appendChild(card);
      cards.push(card);
    });
  }

  // ─── Flujo de la prueba ────────────────────────────
  function startTest() {
    faseIdx = 0;
    tableroIdx = 0;
    tiempoAcumuladoMs = 0;
    inicioTableroMs = null;
    resultados = crearResultadosVacios();

    startScreen.classList.add('hidden');
    resultModal.classList.remove('active');
    transitionModal.classList.remove('active');
    startBoard();
  }

  // Prepara y muestra el tablero (faseIdx, tableroIdx) con su memorización inicial
  function startBoard() {
    flippedCards = [];
    matchedPairs = 0;
    errors = 0;
    isLocked = true;
    isGameActive = false;
    cardErrorMap = {};
    clearInterval(timerInterval);
    inicioTableroMs = null;

    createBoard();
    updateDisplays();
    updateErrorPanel();

    // Memorización: mostrar todas las cartas unos segundos
    setTimeout(() => {
      cards.forEach(c => c.classList.add('flipped'));
      phaseOverlay.classList.add('active');
      startCountdown(FASES[faseIdx].memorizar);
    }, 300);
  }

  // ─── Countdown ──────────────────────────────────────
  function startCountdown(segundos) {
    let remaining = segundos;
    countdownEl.textContent = remaining;

    const cdInterval = setInterval(() => {
      remaining--;
      countdownEl.textContent = remaining;

      if (remaining <= 0) {
        clearInterval(cdInterval);
        phaseOverlay.classList.remove('active');
        cards.forEach(c => c.classList.remove('flipped'));

        // Empieza el juego real tras la animación de volteo
        setTimeout(() => {
          isLocked = false;
          isGameActive = true;
          startTimer();
        }, 600);
      }
    }, 1000);
  }

  // ─── Timer ──────────────────────────────────────────
  function startTimer() {
    inicioTableroMs = Date.now();
    timerDisplay.textContent = formatTime(Math.floor(tiempoJugadoMs() / 1000));
    timerInterval = setInterval(() => {
      timerDisplay.textContent = formatTime(Math.floor(tiempoJugadoMs() / 1000));
    }, 250);
  }

  function formatTime(totalSec) {
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  // ─── Card Click Handler ─────────────────────────────
  function onCardClick(card) {
    if (isLocked) return;
    if (!isGameActive) return;
    if (card.classList.contains('flipped')) return;
    if (card.classList.contains('matched')) return;
    if (flippedCards.length >= 2) return;

    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
      checkMatch();
    }
  }

  // ─── Check Match ────────────────────────────────────
  function checkMatch() {
    isLocked = true;
    const fase = FASES[faseIdx];
    const [c1, c2] = flippedCards;

    if (c1.dataset.emoji === c2.dataset.emoji) {
      // Pareja encontrada
      matchedPairs++;
      c1.classList.add('matched', 'match-pop');
      c2.classList.add('matched', 'match-pop');
      flippedCards = [];
      updateDisplays();

      if (matchedPairs === fase.pares) {
        finishBoard(true);
      } else {
        isLocked = false;
      }
    } else {
      // Error: dos cartas que no son pareja
      errors++;
      updateDisplays();

      const idx1 = parseInt(c1.dataset.index);
      const idx2 = parseInt(c2.dataset.index);
      cardErrorMap[idx1] = (cardErrorMap[idx1] || 0) + 1;
      cardErrorMap[idx2] = (cardErrorMap[idx2] || 0) + 1;

      c1.classList.add('shake');
      c2.classList.add('shake');
      highlightRepeatedErrors(idx1, idx2);
      updateErrorPanel();

      const limiteAlcanzado = errors > fase.limiteErrores;
      if (limiteAlcanzado) {
        // Se detiene el tiempo en el momento del error que agota el límite
        finishBoard(false, 900);
        return;
      }

      setTimeout(() => {
        c1.classList.remove('flipped', 'shake');
        c2.classList.remove('flipped', 'shake');
        flippedCards = [];
        isLocked = false;
      }, 900);
    }
  }

  // ─── Highlight Repeated Errors ──────────────────────
  function highlightRepeatedErrors(idx1, idx2) {
    if (cardErrorMap[idx1] > 1) {
      cards[idx1].classList.add('error-highlight');
      setTimeout(() => cards[idx1].classList.remove('error-highlight'), 1200);
    }
    if (cardErrorMap[idx2] > 1) {
      cards[idx2].classList.add('error-highlight');
      setTimeout(() => cards[idx2].classList.remove('error-highlight'), 1200);
    }
  }

  // ─── Update Error Panel ─────────────────────────────
  function updateErrorPanel() {
    // Find cards flipped incorrectly more than once
    const repeatedErrors = [];

    for (const [idx, count] of Object.entries(cardErrorMap)) {
      if (count > 1) {
        const emoji = cards[parseInt(idx)].dataset.emoji;
        repeatedErrors.push({ idx: parseInt(idx), emoji, count });
      }
    }

    if (repeatedErrors.length === 0) {
      errorPanelBody.innerHTML = '<p class="no-errors">¡Sin errores repetidos aún!</p>';
      return;
    }

    // Group by emoji
    const emojiGroups = {};
    repeatedErrors.forEach(({ emoji, count, idx }) => {
      if (!emojiGroups[emoji]) {
        emojiGroups[emoji] = { totalRepeats: 0, positions: [] };
      }
      emojiGroups[emoji].totalRepeats += count;
      emojiGroups[emoji].positions.push({ idx, count });
    });

    let html = '';
    for (const [emoji, data] of Object.entries(emojiGroups)) {
      const posText = data.positions.map(p => `pos ${p.idx + 1}: ${p.count}×`).join(', ');
      html += `
        <div class="error-item">
          <span class="error-item-emoji">${emoji}</span>
          <span class="error-item-text">Volteada incorrectamente (${posText})</span>
          <span class="error-item-count">${data.totalRepeats} veces</span>
        </div>
      `;
    }

    errorPanelBody.innerHTML = html;
  }

  // ─── Fin de un tablero ──────────────────────────────
  // completado=false significa que se agotó el límite de errores: la prueba termina.
  // retrasoMs deja ver el último error antes de cambiar de pantalla.
  function finishBoard(completado, retrasoMs = 600) {
    isGameActive = false;
    isLocked = true;
    clearInterval(timerInterval);
    if (inicioTableroMs !== null) {
      tiempoAcumuladoMs += Date.now() - inicioTableroMs;
      inicioTableroMs = null;
    }

    // Registrar el tablero en los resultados de su fase
    const rf = resultados[faseIdx];
    const rt = rf.tableros[tableroIdx];
    rt.paresEncontrados = matchedPairs;
    rt.errores = errors;
    rt.completado = completado;
    rt.jugado = true;
    rf.paresEncontrados += matchedPairs;
    rf.errores += errors;

    setTimeout(() => {
      if (!completado) {
        showFinalResults(true);
      } else if (faseIdx === FASES.length - 1 && tableroIdx === TABLEROS_POR_FASE - 1) {
        showFinalResults(false);
      } else {
        showTransition();
      }
    }, retrasoMs);
  }

  // ─── Transición entre tableros / fases ──────────────
  function showTransition() {
    const cambiaFase = tableroIdx === TABLEROS_POR_FASE - 1;
    const sigFase = cambiaFase ? faseIdx + 1 : faseIdx;
    const sigTablero = cambiaFase ? 0 : tableroIdx + 1;

    $('#transIcon').textContent = cambiaFase ? '🎉' : '✅';
    $('#transTitle').textContent = cambiaFase
      ? `¡Fase ${faseIdx + 1} completada!`
      : `¡Tablero ${tableroIdx + 1} completado!`;
    $('#transText').textContent = cambiaFase
      ? `Sigue la Fase ${sigFase + 1}/4 con tableros de ${FASES[sigFase].tamano}. Límite: ${FASES[sigFase].limiteErrores} errores por tablero.`
      : `Sigue el Tablero ${sigTablero + 1}/${TABLEROS_POR_FASE} de la Fase ${sigFase + 1} (${FASES[sigFase].tamano}).`;

    transitionModal.classList.add('active');
    btnContinue.focus();
  }

  function onContinue() {
    transitionModal.classList.remove('active');
    if (tableroIdx === TABLEROS_POR_FASE - 1) {
      faseIdx++;
      tableroIdx = 0;
    } else {
      tableroIdx++;
    }
    startBoard();
  }

  // ─── Resultados finales ─────────────────────────────
  function showFinalResults(terminoPorErrores) {
    // Cálculo de métricas sobre toda la prueba
    const aciertos = resultados.reduce((s, f) => s + f.paresEncontrados, 0);
    const erroresTotales = resultados.reduce((s, f) => s + f.errores, 0);
    const intentos = aciertos + erroresTotales;
    const precisionPct = intentos > 0 ? Math.round((aciertos / intentos) * 1000) / 10 : 0;
    // Puntaje: promedio del % de pares encontrados de cada fase (fase no alcanzada = 0%)
    const puntaje = Math.round(
      resultados.reduce((s, f) => s + (f.paresEncontrados / f.paresTotales) * 100, 0) / FASES.length
    );
    const tiempoMs = Math.round(tiempoAcumuladoMs);
    const fasesCompletadas = resultados.filter(f => f.tableros.every(t => t.completado)).length;

    // (cada tablero incluye además el campo auxiliar "jugado")
    const detalle = {
      terminoPorErrores,
      faseAlcanzada: faseIdx + 1,
      tableroAlcanzado: tableroIdx + 1,
      fasesCompletadas,
      fases: resultados
    };

    // Pantalla de resultados
    $('#resIcon').textContent = terminoPorErrores ? '🛑' : '🏆';
    $('#resTitle').textContent = terminoPorErrores ? 'La prueba ha terminado' : '¡Prueba completada!';
    $('#resSubtitle').textContent = terminoPorErrores
      ? `Superaste el límite de errores. Llegaste hasta la fase ${faseIdx + 1}, tablero ${tableroIdx + 1}.`
      : 'Completaste las 4 fases (8 tableros).';
    $('#resPuntaje').textContent = puntaje;
    $('#resTiempo').textContent = formatTime(Math.floor(tiempoMs / 1000));
    $('#resAciertos').textContent = aciertos;
    $('#resErrores').textContent = erroresTotales;
    $('#resFases').innerHTML = '<h4>Resumen por fase</h4>' + resultados.map((f, i) => {
      const alcanzada = f.tableros.some(t => t.jugado);
      const texto = alcanzada
        ? `${f.paresEncontrados}/${f.paresTotales} pares · ${f.errores} errores`
        : 'No alcanzada';
      return `
        <div class="error-item">
          <span class="error-item-text"><strong>Fase ${i + 1}</strong> (${f.tamano}): ${texto}</span>
        </div>`;
    }).join('');

    setTimeout(() => resultModal.classList.add('active'), 100);

    // Enviar el resultado al backend (una sola vez por prueba)
    enviarResultadoAlServidor({
      prueba: 'memoria',
      puntaje,
      precisionPct,
      tiempoMs,
      errores: erroresTotales,
      detalle
    });
  }

  // ─── Actualizar indicadores ─────────────────────────
  function updateDisplays() {
    const fase = FASES[faseIdx];
    progFase.textContent = `Fase ${faseIdx + 1}/${FASES.length}`;
    progTablero.textContent = `Tablero ${tableroIdx + 1}/${TABLEROS_POR_FASE}`;
    progErrores.textContent = `Errores ${errors}/${fase.limiteErrores}`;
    matchesDisplay.textContent = `${matchedPairs} / ${fase.pares}`;
    errorsDisplay.textContent = `${errors} / ${fase.limiteErrores}`;
    if (inicioTableroMs === null) timerDisplay.textContent = formatTime(Math.floor(tiempoAcumuladoMs / 1000));
  }

  // ─── Envío de resultados al backend ─────────────────
  function enviarResultadoAlServidor(datos) {
    const estudianteId = localStorage.getItem('estudianteId');
    if (!estudianteId) return; // sin sesión de estudiante no se guarda
    try {
      // SIN BACKEND: el resultado se guarda en este navegador
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
    } catch (e) { }
  }

  // ─── Event Listeners ───────────────────────────────
  btnStart.addEventListener('click', startTest);
  btnContinue.addEventListener('click', onContinue);

  // ─── Init ──────────────────────────────────────────
  createParticles();

};
