/**
 * Desafío de Atención - Efecto Stroop (versión por fases)
 *
 * Estructura de la prueba:
 *   - 3 fases (Color de la tinta, Lee la palabra, Mixta)
 *   - 5 niveles por fase (1 estímulo por nivel) => 15 estímulos
 *   - Los errores se acumulan en TODA la prueba; al llegar a 5 se cierra.
 */

// ============================================================================
// Configuración
// ============================================================================
const COLOR_PALETTE = [
  { id: 'rojo', name: 'Rojo', hex: '#EF4444' },
  { id: 'verde', name: 'Verde', hex: '#22C55E' },
  { id: 'azul', name: 'Azul', hex: '#3B82F6' },
  { id: 'amarillo', name: 'Amarillo', hex: '#EAB308' },
  { id: 'morado', name: 'Morado', hex: '#A855F7' },
  { id: 'naranja', name: 'Naranja', hex: '#F97316' },
  { id: 'rosa', name: 'Rosa', hex: '#EC4899' },
  { id: 'cian', name: 'Cian', hex: '#06B6D4' }
];

const COLOR_BY_ID = Object.fromEntries(COLOR_PALETTE.map(c => [c.id, c]));

const TOTAL_PHASES = 3;
const LEVELS_PER_PHASE = 5;
const STIMULI_PER_LEVEL = 1;
const STIMULI_PER_PHASE = LEVELS_PER_PHASE * STIMULI_PER_LEVEL; // 5
const TOTAL_STIMULI = TOTAL_PHASES * STIMULI_PER_PHASE;         // 15
const MAX_ERRORS = 5;
const FEEDBACK_PAUSE_MS = 750;

// Número de opciones por nivel (índice 0 = nivel 1): 4, 4, 5, 5, 6
const OPTIONS_BY_LEVEL = [4, 4, 5, 5, 6];

// Cuántos distractores "parecidos" al color correcto se fuerzan por nivel
const SIMILAR_DISTRACTORS_BY_LEVEL = [0, 0, 1, 1, 2];

// Colores visualmente cercanos entre sí (para los distractores difíciles)
const SIMILAR_COLORS = {
  rojo: ['naranja', 'rosa'],
  verde: ['cian', 'amarillo'],
  azul: ['cian', 'morado'],
  amarillo: ['naranja', 'verde'],
  morado: ['rosa', 'azul'],
  naranja: ['amarillo', 'rojo'],
  rosa: ['morado', 'rojo'],
  cian: ['azul', 'verde']
};

// Definición de las 3 fases. "task" indica qué debe responder el alumno:
// 'tinta' (color de la tinta), 'palabra' (lo que dice) o 'mixta' (al azar).
const PHASES = [
  {
    nombre: 'Color de la tinta',
    task: 'tinta',
    descripcion: 'Verás el nombre de un color escrito con tinta de OTRO color. Elige la palabra que corresponda al <strong>color de la TINTA</strong> (en las opciones solo aparece la palabra, sin color).',
    ejemplo: [{ word: 'rojo', ink: 'azul', task: 'tinta' }]
  },
  {
    nombre: 'Lee la palabra',
    task: 'palabra',
    descripcion: 'Ahora elige el botón pintado con el color de <strong>lo que DICE la palabra</strong> e ignora el color de la tinta (en las opciones solo aparece el color, sin texto).',
    ejemplo: [{ word: 'rojo', ink: 'azul', task: 'palabra' }]
  },
  {
    nombre: 'Mixta',
    task: 'mixta',
    descripcion: 'En cada estímulo una etiqueta grande te indicará qué responder: <strong>TINTA</strong> (opciones solo con palabra) o <strong>PALABRA</strong> (botones solo con color). Fíjate bien en la etiqueta antes de elegir.',
    ejemplo: [
      { word: 'rojo', ink: 'azul', task: 'tinta' },
      { word: 'rojo', ink: 'azul', task: 'palabra' }
    ]
  }
];

const TASK_TEXT = {
  tinta: {
    label: 'TINTA',
    hint: '¿De qué color es la tinta?',
    banner: 'Selecciona el <strong>COLOR DE LA TINTA</strong> con la que está escrita la palabra. <em>¡Ignora lo que dice el texto!</em>'
  },
  palabra: {
    label: 'PALABRA',
    hint: '¿Qué dice la palabra?',
    banner: 'Selecciona lo que <strong>DICE LA PALABRA</strong>. <em>¡Ignora el color de la tinta!</em>'
  }
};

// ============================================================================
// Utilidades
// ============================================================================

/** Baraja un arreglo (Fisher-Yates) sin modificar el original. */
function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Genera las opciones de un estímulo.
 * Siempre incluye la respuesta correcta y el "color en conflicto" (el otro
 * color del estímulo), y completa con distractores. En niveles altos se
 * prefieren distractores parecidos a la respuesta correcta.
 */
function buildOptions(level, correctId, conflictId) {
  const total = OPTIONS_BY_LEVEL[level - 1];
  const chosen = [correctId, conflictId];
  const pool = COLOR_PALETTE.map(c => c.id).filter(id => !chosen.includes(id));

  // 1) Distractores parecidos (según el nivel)
  const similarWanted = SIMILAR_DISTRACTORS_BY_LEVEL[level - 1];
  const similarCandidates = [
    ...shuffle(SIMILAR_COLORS[correctId]),
    ...shuffle(SIMILAR_COLORS[conflictId])
  ].filter(id => pool.includes(id));
  for (const id of similarCandidates) {
    if (chosen.length - 2 >= similarWanted) break;
    if (!chosen.includes(id)) chosen.push(id);
  }

  // 2) Resto de distractores al azar
  for (const id of shuffle(pool)) {
    if (chosen.length >= total) break;
    if (!chosen.includes(id)) chosen.push(id);
  }

  return shuffle(chosen).map(id => COLOR_BY_ID[id]);
}

/**
 * Genera los 15 estímulos de una fase (5 niveles x 3 estímulos).
 * Todos son incongruentes (palabra y tinta distintas) y no repiten combinación.
 */
function generatePhaseStimuli(phaseIndex) {
  const phase = PHASES[phaseIndex];

  // Tarea de cada estímulo; en la fase mixta se reparte de forma equilibrada (8/7)
  let tasks;
  if (phase.task === 'mixta') {
    const extra = Math.random() < 0.5 ? 'tinta' : 'palabra';
    const other = extra === 'tinta' ? 'palabra' : 'tinta';
    tasks = shuffle([
      ...Array(Math.ceil(STIMULI_PER_PHASE / 2)).fill(extra),
      ...Array(Math.floor(STIMULI_PER_PHASE / 2)).fill(other)
    ]);
  } else {
    tasks = Array(STIMULI_PER_PHASE).fill(phase.task);
  }

  const usedCombos = new Set();
  const stimuli = [];
  for (let n = 0; n < STIMULI_PER_PHASE; n++) {
    const level = Math.floor(n / STIMULI_PER_LEVEL) + 1;
    let word, ink, key;
    do {
      word = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)];
      const inks = COLOR_PALETTE.filter(c => c.id !== word.id);
      ink = inks[Math.floor(Math.random() * inks.length)];
      key = `${word.id}-${ink.id}`;
    } while (usedCombos.has(key));
    usedCombos.add(key);

    const task = tasks[n];
    const correct = task === 'tinta' ? ink : word;
    const conflict = task === 'tinta' ? word : ink;
    stimuli.push({
      level,
      indexInLevel: (n % STIMULI_PER_LEVEL) + 1,
      word,
      ink,
      task,
      correct,
      options: buildOptions(level, correct.id, conflict.id)
    });
  }
  return stimuli;
}

// ============================================================================
// Sintetizador de Efectos de Sonido (Web Audio API)
// ============================================================================
class SoundEffects {
  constructor() {
    this.enabled = true;
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playCorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    // Arpegio armónico rápido (Mi5 -> Sol#5)
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.exponentialRampToValueAtTime(830.61, now + 0.12); // G#5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  playIncorrect() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Tono descendente de error
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx.currentTime + idx * 0.1;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

// ============================================================================
// Estado y flujo del juego
// ============================================================================
class StroopGame {
  constructor() {
    this.sfx = new SoundEffects();
    this.acceptingInput = false; // true solo mientras hay un estímulo respondible
    this.cacheDOMElements();
    this.bindEvents();
    this.resetState();

    // Se muestra solo la portada hasta que el alumno pulse "Iniciar Prueba"
    this.showScreen(null);
  }

  /** Reinicia todos los contadores de la prueba. */
  resetState() {
    this.phaseIndex = 0;
    this.stimuli = [];
    this.cursor = 0;            // posición del estímulo dentro de la fase (0-14)
    this.hits = 0;
    this.errors = 0;
    this.totalTimeMs = 0;       // suma de los tiempos de respuesta
    this.stimulusStartTime = 0;
    this.resultSent = false;
    this.phaseStats = PHASES.map(() => ({
      aciertos: 0,
      errores: 0,
      tiempos: [],
      nivelAlcanzado: 0
    }));
  }

  cacheDOMElements() {
    this.startScreen = document.getElementById('startScreen');
    this.btnStartGame = document.getElementById('btnStartGame');

    // Tarjetas (pantallas)
    this.phaseCard = document.getElementById('phase-card');
    this.gameCard = document.getElementById('game-card');
    this.resultsCard = document.getElementById('results-card');

    // Pantalla de instrucciones de fase
    this.phaseKicker = document.getElementById('phase-kicker');
    this.phaseTitle = document.getElementById('phase-title');
    this.phaseDesc = document.getElementById('phase-desc');
    this.phaseExample = document.getElementById('phase-example');
    this.phaseMeta = document.getElementById('phase-meta');
    this.btnStartPhase = document.getElementById('btn-start-phase');

    // Indicadores del juego
    this.banner = document.getElementById('instruction-text');
    this.positionIndicator = document.getElementById('position-indicator');
    this.progressBar = document.getElementById('progress-bar');
    this.hitsCount = document.getElementById('hits-count');
    this.missesCount = document.getElementById('misses-count');

    // Estímulo
    this.stimulusBox = document.getElementById('stimulus-box');
    this.taskLabel = document.getElementById('task-label');
    this.stimulusHint = document.getElementById('stimulus-hint');
    this.stimulusWord = document.getElementById('stimulus-word');
    this.feedbackToast = document.getElementById('feedback-toast');

    // Opciones
    this.optionsHint = document.getElementById('options-hint');
    this.optionsGrid = document.getElementById('options-grid');

    // Resultados
    this.finalHits = document.getElementById('final-hits');
    this.finalMisses = document.getElementById('final-misses');
    this.finalAccuracy = document.getElementById('final-accuracy');
    this.finalScore = document.getElementById('final-score');
    this.resultsIcon = document.getElementById('results-icon');
    this.resultsSubtitle = document.getElementById('results-subtitle');
    this.evaluationTitle = document.getElementById('evaluation-title');
    this.evaluationDesc = document.getElementById('evaluation-desc');
    this.phasesBreakdown = document.getElementById('phases-breakdown');

    // Sonido
    this.btnSoundToggle = document.getElementById('btn-sound-toggle');
    this.soundIconOn = document.getElementById('sound-icon-on');
    this.soundIconOff = document.getElementById('sound-icon-off');
  }

  bindEvents() {
    this.btnStartGame.addEventListener('click', () => {
      this.startScreen.classList.add('hidden');
      this.startNewGame();
    });

    this.btnStartPhase.addEventListener('click', () => this.beginPhase());

    // Teclado: teclas 1 a 6 eligen la opción correspondiente
    window.addEventListener('keydown', (e) => {
      if (!this.acceptingInput || !/^[1-6]$/.test(e.key)) return;
      const buttons = this.optionsGrid.querySelectorAll('.option-btn');
      const btn = buttons[parseInt(e.key, 10) - 1];
      if (btn) btn.click();
    });

    // Control de sonido
    this.btnSoundToggle.addEventListener('click', () => {
      const isSoundOn = this.sfx.toggle();
      this.soundIconOn.classList.toggle('hidden', !isSoundOn);
      this.soundIconOff.classList.toggle('hidden', isSoundOn);
      this.btnSoundToggle.setAttribute('aria-label', isSoundOn ? 'Desactivar sonido' : 'Activar sonido');
    });
  }

  /** Muestra una sola tarjeta ('phase', 'game', 'results') u ninguna (null). */
  showScreen(name) {
    this.phaseCard.classList.toggle('hidden', name !== 'phase');
    this.gameCard.classList.toggle('hidden', name !== 'game');
    this.resultsCard.classList.toggle('hidden', name !== 'results');
  }

  // --------------------------------------------------------------------------
  // Flujo: prueba -> fase -> estímulo
  // --------------------------------------------------------------------------

  startNewGame() {
    this.resetState();
    this.hitsCount.textContent = '0';
    this.missesCount.textContent = `0/${MAX_ERRORS}`;
    this.progressBar.style.width = '0%';
    this.showPhaseIntro();
  }

  /** Pantalla de instrucciones previa a cada fase. */
  showPhaseIntro() {
    const phase = PHASES[this.phaseIndex];
    this.acceptingInput = false;

    this.phaseKicker.textContent = `Fase ${this.phaseIndex + 1} de ${TOTAL_PHASES}`;
    this.phaseTitle.textContent = phase.nombre;
    this.phaseDesc.innerHTML = phase.descripcion;

    // Ejemplo ilustrativo (no cuenta para la prueba)
    this.phaseExample.innerHTML = phase.ejemplo.map(ex => {
      const word = COLOR_BY_ID[ex.word];
      const ink = COLOR_BY_ID[ex.ink];
      const answer = ex.task === 'tinta' ? ink : word;
      const label = TASK_TEXT[ex.task].label;
      return `
        <div class="example-item">
          <span class="task-label task-${ex.task}">${label}</span>
          <span class="example-word" style="color:${ink.hex}">${word.name}</span>
          <span class="example-answer">Respuesta: <strong>${answer.name}</strong></span>
        </div>`;

    }).join('');

    this.phaseMeta.textContent =
      `${LEVELS_PER_PHASE} niveles · ` +
      `Errores acumulados: ${this.errors}/${MAX_ERRORS}`;

    this.showScreen('phase');
  }

  /** Se pulsó "Comenzar fase": genera los estímulos y muestra el primero. */
  beginPhase() {
    this.stimuli = generatePhaseStimuli(this.phaseIndex);
    this.cursor = 0;
    this.showScreen('game');
    this.renderStimulus();
  }

  renderStimulus() {
    const stim = this.stimuli[this.cursor];
    const stats = this.phaseStats[this.phaseIndex];
    stats.nivelAlcanzado = stim.level;
    const text = TASK_TEXT[stim.task];

    // Indicadores superiores
    this.positionIndicator.textContent =
      `Fase ${this.phaseIndex + 1}/${TOTAL_PHASES} · Nivel ${stim.level}/${LEVELS_PER_PHASE}`;

    const answered = this.hits + this.errors;
    this.progressBar.style.width = `${(answered / TOTAL_STIMULI) * 100}%`;
    this.banner.innerHTML = text.banner;

    // Limpiar animaciones y retroalimentación anteriores
    this.stimulusBox.classList.remove('correct-anim', 'incorrect-anim');
    this.feedbackToast.className = 'feedback-toast hidden';
    this.feedbackToast.textContent = '';

    // Etiqueta de la tarea + pregunta
    this.taskLabel.textContent = text.label;
    this.taskLabel.className = `task-label task-${stim.task}`;
    this.stimulusHint.textContent = text.hint;

    // Palabra con tinta incongruente
    this.stimulusWord.textContent = stim.word.name;
    this.stimulusWord.style.color = stim.ink.hex;
    this.stimulusWord.style.transform = 'scale(0.9)';
    setTimeout(() => { this.stimulusWord.style.transform = 'scale(1)'; }, 50);

    // Opciones (4 a 6)
    const n = stim.options.length;
    this.optionsHint.textContent = stim.task === 'tinta'
      ? `Elige la palabra del color de la tinta (teclas 1 a ${n}):`
      : `Elige el color que dice la palabra (teclas 1 a ${n}):`;
    this.optionsGrid.className = `options-grid options-${n}`;
    this.optionsGrid.innerHTML = '';
    stim.options.forEach((colorOpt, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.dataset.colorId = colorOpt.id;
      if (stim.task === 'tinta') {
        btn.className = 'option-btn option-mode-word';
        btn.setAttribute('aria-label', `Opción ${idx + 1}: ${colorOpt.name}`);
        btn.innerHTML = `<div class="option-left"><span class="option-key-badge">${idx + 1}</span><span class="option-name">${colorOpt.name}</span></div>`;
      } else {
        btn.className = 'option-btn option-mode-color';
        btn.style.backgroundColor = colorOpt.hex;
        btn.style.borderColor = colorOpt.hex;
        btn.setAttribute('aria-label', `Opción ${idx + 1}`);
        btn.innerHTML = `<div class="option-left"><span class="option-key-badge">${idx + 1}</span></div>`;
      }






      btn.addEventListener('click', () => this.handleOptionSelect(colorOpt, btn));
      this.optionsGrid.appendChild(btn);
    });

    this.acceptingInput = true;
    this.stimulusStartTime = performance.now();
  }

  handleOptionSelect(selectedColor, selectedBtn) {
    if (!this.acceptingInput) return;
    this.acceptingInput = false;

    const stim = this.stimuli[this.cursor];
    const stats = this.phaseStats[this.phaseIndex];
    const reactionTimeMs = Math.round(performance.now() - this.stimulusStartTime);
    const isCorrect = selectedColor.id === stim.correct.id;
    const askedText = stim.task === 'tinta' ? 'La tinta' : 'La palabra';

    this.totalTimeMs += reactionTimeMs;
    stats.tiempos.push(reactionTimeMs);

    const allButtons = this.optionsGrid.querySelectorAll('.option-btn');
    allButtons.forEach(b => { b.disabled = true; });

    if (isCorrect) {
      this.hits++;
      stats.aciertos++;
      this.hitsCount.textContent = this.hits;
      this.sfx.playCorrect();
      selectedBtn.classList.add('btn-selected-correct');
      this.stimulusBox.classList.add('correct-anim');
      this.feedbackToast.textContent = `✓ ¡Correcto! ${askedText} es ${stim.correct.name}`;
      this.feedbackToast.className = 'feedback-toast correct';
    } else {
      // Cada respuesta incorrecta suma 1 error acumulado en toda la prueba
      this.errors++;
      stats.errores++;
      this.missesCount.textContent = `${this.errors}/${MAX_ERRORS}`;
      this.sfx.playIncorrect();
      selectedBtn.classList.add('btn-selected-incorrect');
      this.stimulusBox.classList.add('incorrect-anim');
      allButtons.forEach(b => {
        if (b.dataset.colorId === stim.correct.id) b.classList.add('btn-show-solution');
      });
      this.feedbackToast.textContent = `✗ ¡Error! ${askedText} ${stim.task === 'tinta' ? 'era' : 'decía'} ${stim.correct.name}`;
      this.feedbackToast.className = 'feedback-toast incorrect';
    }

    // Pausa breve para asimilar la retroalimentación y luego avanzar
    setTimeout(() => this.advance(), FEEDBACK_PAUSE_MS);
  }

  /** Decide el siguiente paso: cierre por errores, siguiente estímulo, fase o fin. */
  advance() {
    if (this.errors >= MAX_ERRORS) {
      this.showFinalResults(true);
      return;
    }
    this.cursor++;
    if (this.cursor < STIMULI_PER_PHASE) {
      this.renderStimulus();
    } else if (this.phaseIndex < TOTAL_PHASES - 1) {
      this.phaseIndex++;
      this.showPhaseIntro();
    } else {
      this.showFinalResults(false);
    }
  }

  // --------------------------------------------------------------------------
  // Resultados
  // --------------------------------------------------------------------------

  /** Promedio entero de un arreglo de milisegundos (0 si está vacío). */
  static mean(values) {
    return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  }

  showFinalResults(closedByErrors) {
    this.acceptingInput = false;
    this.progressBar.style.width = `${((this.hits + this.errors) / TOTAL_STIMULI) * 100}%`;
    this.showScreen('results');

    const answered = this.hits + this.errors;
    // Los estímulos no alcanzados cuentan como no acertados
    const puntaje = Math.round((this.hits / TOTAL_STIMULI) * 100);
    const precisionPct = answered ? Math.round((this.hits / answered) * 100) : 0;

    this.finalHits.textContent = `${this.hits}/${TOTAL_STIMULI}`;
    this.finalMisses.textContent = `${this.errors}/${MAX_ERRORS}`;
    this.finalAccuracy.textContent = `${precisionPct}%`;
    this.finalScore.textContent = puntaje;

    // Mensaje principal según cómo terminó la prueba
    if (closedByErrors) {
      this.resultsIcon.textContent = '⛔';
      this.resultsSubtitle.textContent = `La prueba se cerró al llegar a ${MAX_ERRORS} errores.`;
    } else if (this.errors === 0) {
      this.sfx.playVictory();
      this.resultsIcon.textContent = '🌟';
      this.resultsSubtitle.textContent = 'Completaste las 3 fases sin cometer errores.';
    } else {
      this.resultsIcon.textContent = '🎯';
      this.resultsSubtitle.textContent = 'Completaste las 3 fases de la prueba de atención.';
    }

    // Diagnóstico según la precisión de lo respondido
    if (precisionPct >= 90) {
      this.evaluationTitle.textContent = 'Control Inhibitorio Excelente';
      this.evaluationDesc.textContent = 'Suprimiste con gran eficacia la interferencia entre la palabra y el color de la tinta, cambiando de criterio según lo que se pedía.';
    } else if (precisionPct >= 70) {
      this.evaluationTitle.textContent = 'Buena Concentración y Flexibilidad';
      this.evaluationDesc.textContent = 'Superaste la mayor parte de la interferencia. La lectura automática compite con la percepción del color y respondiste con buen control.';
    } else {
      this.evaluationTitle.textContent = 'Predominancia de Lectura Automática';
      this.evaluationDesc.textContent = 'Tu respuesta automática (leer la palabra o dejarte llevar por la tinta) interfirió con la consigna. Con práctica el control de la atención mejora.';
    }

    // Desglose por fase
    const fases = this.phaseStats.map((s, i) => ({
      fase: i + 1,
      nombre: PHASES[i].nombre,
      aciertos: s.aciertos,
      errores: s.errores,
      tiempoMedioRespuestaMs: StroopGame.mean(s.tiempos),
      nivelAlcanzado: s.nivelAlcanzado
    }));
    this.renderPhasesBreakdown(fases);

    // Envío único al servidor
    if (this.resultSent) return;
    this.resultSent = true;
    enviarResultadoAlServidor({
      prueba: 'atencion',
      puntaje,
      precisionPct,
      tiempoMs: this.totalTimeMs,
      errores: this.errors,
      detalle: {
        terminoPorErrores: closedByErrors,
        estimulosRespondidos: answered,
        fases
      }
    });
  }

  renderPhasesBreakdown(fases) {
    this.phasesBreakdown.innerHTML = fases.map(f => {
      const reached = f.nivelAlcanzado > 0;
      const stats = reached ? `
        <span class="round-status-tag success">✓ ${f.aciertos} ${f.aciertos === 1 ? 'acierto' : 'aciertos'}</span>
        <span class="round-status-tag failed">✗ ${f.errores} ${f.errores === 1 ? 'error' : 'errores'}</span>
        <span class="phase-meta-chip">${(f.tiempoMedioRespuestaMs / 1000).toFixed(2)} s promedio</span>
        <span class="phase-meta-chip">Nivel ${f.nivelAlcanzado}/${LEVELS_PER_PHASE}</span>`
        : '<span class="phase-meta-chip">No alcanzada</span>';
      return `
        <div class="phase-result-row${reached ? '' : ' not-reached'}">
          <div class="phase-result-name">
            <span class="round-index-badge">F${f.fase}</span>
            <strong>${f.nombre}</strong>
          </div>
          <div class="phase-result-stats">${stats}</div>
        </div>`;

    }).join('');
  }
}

// ── Envío de resultados al backend ──
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
  } catch (e) {}
}

// Iniciar aplicación desde Blazor
window.iniciarAtencion = function () {
  window.stroopGame = new StroopGame();
};