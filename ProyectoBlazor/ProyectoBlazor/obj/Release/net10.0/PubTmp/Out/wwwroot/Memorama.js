/* ═══════════════════════════════════════════════════════
   MEMORAMA POR FASES — Lógica del juego
   4 fases (4x4, 6x6, 8x8, 10x10) × 1 tablero por fase.
   Cada tablero tiene un límite de errores (mitad de sus aciertos disponibles);
   al alcanzar esa cantidad de errores el juego se termina.
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
  // tiempoLimiteSeg: tiempo asignado por nivel según Span de imágenes / Retención de dígitos (~10 min total).
  const FASES = [
    { lado: 4, memorizar: 10, tiempoLimiteSeg: 60, descTiempo: '1 min' },
    { lado: 6, memorizar: 10, tiempoLimiteSeg: 120, descTiempo: '2 min' },
    { lado: 8, memorizar: 10, tiempoLimiteSeg: 180, descTiempo: '3 min' },
    { lado: 10, memorizar: 10, tiempoLimiteSeg: 240, descTiempo: '4 min' }
  ].map(f => {
    const pares = (f.lado * f.lado) / 2;
    return {
      ...f,
      tamano: `${f.lado}x${f.lado}`,
      pares,                                       // pares por tablero (aciertos disponibles)
      limiteErrores: Math.floor(pares / 2)         // errores permitidos por tablero: mitad de aciertos disponibles
    };
  });
  const TABLEROS_POR_FASE = 1;

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
    timerDisplay.style.color = '';
    const faseActual = FASES[faseIdx];
    timerDisplay.title = faseActual ? `Límite para este nivel: ${faseActual.descTiempo}` : '';

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
    actualizarTimer();
    timerInterval = setInterval(actualizarTimer, 250);
  }

  function actualizarTimer() {
    timerDisplay.textContent = formatTime(Math.floor(tiempoJugadoMs() / 1000));
    const fase = FASES[faseIdx];
    const tiempoTableroSec = inicioTableroMs !== null ? Math.floor((Date.now() - inicioTableroMs) / 1000) : 0;
    if (fase && tiempoTableroSec > fase.tiempoLimiteSeg) {
      timerDisplay.style.color = '#ef4444';
      timerDisplay.title = `Tiempo superior al límite de ${fase.descTiempo} (-1 pt)`;
    } else {
      timerDisplay.style.color = '';
      timerDisplay.title = fase ? `Límite para este tablero: ${fase.descTiempo}` : '';
    }
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

      const limiteAlcanzado = errors >= fase.limiteErrores;
      if (limiteAlcanzado) {
        // Se detiene el tiempo en el momento del error que alcanza el límite
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
    let tiempoTableroMs = 0;
    if (inicioTableroMs !== null) {
      tiempoTableroMs = Date.now() - inicioTableroMs;
      tiempoAcumuladoMs += tiempoTableroMs;
      inicioTableroMs = null;
    }

    const fase = FASES[faseIdx];
    const tiempoExcedido = (tiempoTableroMs / 1000) > fase.tiempoLimiteSeg;

    // Registrar el tablero en los resultados de su fase
    const rf = resultados[faseIdx];
    const rt = rf.tableros[tableroIdx];
    rt.paresEncontrados = matchedPairs;
    rt.errores = errors;
    rt.completado = completado;
    rt.jugado = true;
    rt.tiempoMs = tiempoTableroMs;
    rt.tiempoExcedido = tiempoExcedido;
    rf.paresEncontrados += matchedPairs;
    rf.errores += errors;
    rf.tiempoMs = (rf.tiempoMs || 0) + tiempoTableroMs;
    rf.tiempoExcedido = tiempoExcedido;

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
    const sigFase = faseIdx + 1;

    $('#transIcon').textContent = '🎉';
    $('#transTitle').textContent = `¡Fase ${faseIdx + 1} completada!`;
    $('#transText').textContent = `Sigue la Fase ${sigFase + 1}/4 con tablero de ${FASES[sigFase].tamano}. Límite: ${FASES[sigFase].descTiempo} · ${FASES[sigFase].limiteErrores} errores permitidos.`;

    transitionModal.classList.add('active');
    btnContinue.focus();
  }

  function onContinue() {
    transitionModal.classList.remove('active');
    faseIdx++;
    tableroIdx = 0;
    startBoard();
  }

  // ─── Resultados finales ─────────────────────────────
  function showFinalResults(terminoPorErrores) {
    // Cálculo de métricas sobre toda la prueba
    const aciertos = resultados.reduce((s, f) => s + f.paresEncontrados, 0);
    const erroresTotales = resultados.reduce((s, f) => s + f.errores, 0);
    const intentos = aciertos + erroresTotales;
    const precisionPct = intentos > 0 ? Math.round((aciertos / intentos) * 1000) / 10 : 0;
    // Cantidad de niveles (tableros) que sobrepasaron su tiempo específico
    const nivelesTiempoExcedido = resultados.filter(f => f.tiempoExcedido).length;
    // Puntaje base: promedio del % de pares encontrados de cada fase (fase no alcanzada = 0%)
    const puntajeBase = Math.round(
      resultados.reduce((s, f) => s + (f.paresEncontrados / f.paresTotales) * 100, 0) / FASES.length
    );
    // Se resta 1 punto por cada nivel que haya sobrepasado su tiempo
    const puntaje = Math.max(0, Math.min(100, puntajeBase - nivelesTiempoExcedido));
    const tiempoMs = Math.round(tiempoAcumuladoMs);
    const fasesCompletadas = resultados.filter(f => f.tableros.every(t => t.completado)).length;

    // (cada tablero incluye además el campo auxiliar "jugado")
    const detalle = {
      terminoPorErrores,
      faseAlcanzada: faseIdx + 1,
      tableroAlcanzado: tableroIdx + 1,
      fasesCompletadas,
      nivelesTiempoExcedido,
      fases: resultados
    };

    // Pantalla de resultados
    $('#resIcon').textContent = terminoPorErrores ? '🛑' : '🏆';
    $('#resTitle').textContent = terminoPorErrores ? 'La prueba ha terminado' : '¡Prueba completada!';
    let penalTexto = nivelesTiempoExcedido > 0
      ? ` · ${nivelesTiempoExcedido} ${nivelesTiempoExcedido === 1 ? 'nivel sobrepasó el tiempo' : 'niveles sobrepasaron el tiempo'} (-${nivelesTiempoExcedido} pt${nivelesTiempoExcedido === 1 ? '' : 's'})`
      : '';
    $('#resSubtitle').textContent = terminoPorErrores
      ? `Llegaste al límite de errores permitidos en la fase ${faseIdx + 1} (${FASES[faseIdx].tamano}).${penalTexto}`
      : `Completaste las 4 fases (4 tableros).${penalTexto}`;
    $('#resPuntaje').textContent = puntaje;
    $('#resTiempo').textContent = formatTime(Math.floor(tiempoMs / 1000));
    $('#resAciertos').textContent = aciertos;
    $('#resErrores').textContent = erroresTotales;
    $('#resFases').innerHTML = '<h4>Resumen por fase</h4>' + resultados.map((f, i) => {
      const alcanzada = f.tableros.some(t => t.jugado);
      const excedido = f.tiempoExcedido;
      const texto = alcanzada
        ? `${f.paresEncontrados}/${f.paresTotales} pares · ${f.errores} errores · ${(f.tiempoMs / 1000).toFixed(1)}s` + (excedido ? ` ⚠️ (Límite: ${FASES[i].descTiempo} · -1 pt)` : '')
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

  // ─── Envío de resultados al backend (SQL Server) ────
  function enviarResultadoAlServidor(datos) {
    const estudianteId = localStorage.getItem('estudianteId');
    if (!estudianteId) return; // sin sesión de estudiante no se guarda
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

  // ─── Event Listeners ───────────────────────────────
  btnStart.addEventListener('click', startTest);
  btnContinue.addEventListener('click', onContinue);

  // ─── Init ──────────────────────────────────────────
  createParticles();

};
