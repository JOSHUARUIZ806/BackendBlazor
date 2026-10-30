window.iniciarRazonamiento = function () {
  // Si este alumno ya terminó esta prueba, no puede volver a entrar.
  (function () {
    var P = 'razonamiento';
    try {
      var id = localStorage.getItem('estudianteId');
      if (!id) return;
      var d = JSON.parse(localStorage.getItem('evaluacionCognitiva') || '{}');
      if ((d.resultados || []).some(function (r) { return r.estudiante_id === Number(id) && r.prueba === P; })) {
        location.replace('/Estudiante?completada=' + P);
      }
    } catch (e) {}
  })();

  // ===== CONFIGURACIÓN DE LA PRUEBA =====
  // 15 niveles x 3 preguntas = 45 ítems. Cada categoría ocupa 3 niveles consecutivos.
  const PREGUNTAS_POR_NIVEL = 3;
  const NIVELES_POR_CATEGORIA = 3;
  const TOTAL_NIVELES = 15;
  const TOTAL_PREGUNTAS = TOTAL_NIVELES * PREGUNTAS_POR_NIVEL;

  const CATEGORIAS = [
    { id: 'numeros', nombre: 'Números', grafico: false,
      descripcion: 'Descubre el número que falta: observa sumas, operaciones alternadas y series entrelazadas.' },
    { id: 'letras', nombre: 'Letras', grafico: false,
      descripcion: 'Usa el orden del alfabeto español (incluye la Ñ) para encontrar la letra que falta.' },
    { id: 'figuras', nombre: 'Figuras', grafico: true,
      descripcion: 'Observa cómo cambian la forma, el relleno, el tamaño o el giro de cada figura.' },
    { id: 'flechas', nombre: 'Flechas', grafico: true,
      descripcion: 'Fíjate en cuántos grados gira cada flecha (sentido horario = como las manecillas) y en su relleno. Nivel difícil.' },
    { id: 'relojes', nombre: 'Relojes', grafico: true,
      descripcion: 'Observa cómo avanza la hora. La manecilla corta azul marca las horas y la larga ámbar los minutos. Nivel muy difícil.' }
  ];

  // ===== ESTADO DE LA APLICACIÓN =====
  const state = {
    currentQuestion: 0,   // índice global de la pregunta (0-44)
    correctCount: 0,
    wrongCount: 0,
    timerInterval: null,
    questionStartTime: 0,
    results: [],          // { nivel, categoria, correct, timeMs }
    answered: false,
    questions: [],
    enviado: false        // evita enviar el resultado más de una vez
  };

  // ===== DOM =====
  const $ = id => document.getElementById(id);
  const screens = {
    start: $('screen-start'),
    level: $('screen-level'),
    quiz: $('screen-quiz'),
    results: $('screen-results')
  };

  // ===== UTILIDADES ALEATORIAS =====
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function pick(arr) {
    return arr[randInt(0, arr.length - 1)];
  }
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  // Módulo que siempre devuelve un valor no negativo
  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  // ===== ELEMENTOS DE UNA SUCESIÓN =====
  // --- Números ---
  function itemNumero(n) {
    return { key: 'n:' + n, html: String(n), valor: n };
  }
  function itemsNumeros(lista) {
    return lista.filter(n => Number.isInteger(n) && n > 0).map(itemNumero);
  }

  // --- Letras (alfabeto español de 27 letras) ---
  const ALFABETO = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  function itemLetra(i) {
    return { key: 'l:' + i, html: ALFABETO[i], indice: i };
  }
  function itemsLetras(lista) {
    return lista.filter(i => Number.isInteger(i) && i >= 0 && i < ALFABETO.length).map(itemLetra);
  }
  function letrasValidas(indices) {
    return indices.every(i => i >= 0 && i < ALFABETO.length);
  }

  // ===== DIBUJO SVG: FIGURAS =====
  const AZUL = '#1A3560';
  const AMBAR = '#C97B2E';

  function puntosPoligono(lados, radio, radioInterno) {
    const pts = [];
    const total = radioInterno ? lados * 2 : lados;
    for (let i = 0; i < total; i++) {
      const r = radioInterno && i % 2 === 1 ? radioInterno : radio;
      const ang = (-90 + (360 / total) * i) * Math.PI / 180;
      pts.push((r * Math.cos(ang)).toFixed(1) + ',' + (r * Math.sin(ang)).toFixed(1));
    }
    return pts.join(' ');
  }

  const FORMAS = {
    circulo:   { nombre: 'círculo',             asim: false, dibujo: '<circle r="36"/>' },
    cuadrado:  { nombre: 'cuadrado',            asim: false, dibujo: '<rect x="-32" y="-32" width="64" height="64"/>' },
    triangulo: { nombre: 'triángulo',           asim: false, dibujo: '<polygon points="0,-38 36,28 -36,28"/>' },
    estrella:  { nombre: 'estrella',            asim: false, dibujo: `<polygon points="${puntosPoligono(5, 42, 17)}"/>` },
    rombo:     { nombre: 'rombo',               asim: false, dibujo: '<polygon points="0,-42 30,0 0,42 -30,0"/>' },
    pentagono: { nombre: 'pentágono',           asim: false, dibujo: `<polygon points="${puntosPoligono(5, 38)}"/>` },
    trirect:   { nombre: 'triángulo rectángulo', asim: true,  dibujo: '<polygon points="-34,34 34,34 -34,-34"/>' },
    semicirculo: { nombre: 'semicírculo',       asim: true,  dibujo: '<path d="M-40 20 A40 40 0 0 1 40 20 Z"/>' }
  };
  const FORMAS_BASICAS = ['circulo', 'cuadrado', 'triangulo', 'estrella', 'rombo', 'pentagono'];

  const TAM_MAX = 5;
  function escalaDeTam(tam) { return 0.4 + tam * 0.12; }

  function pintura(relleno) {
    return relleno
      ? `fill="${AZUL}" stroke="${AZUL}"`
      : `fill="#FFFFFF" stroke="${AZUL}"`;
  }

  function figuraSVG(a) {
    const esc = escalaDeTam(a.tam);
    const desc = `${FORMAS[a.forma].nombre} ${a.relleno ? 'lleno' : 'vacío'}`;
    return `<svg viewBox="-50 -50 100 100" role="img" aria-label="${desc}">` +
      `<g transform="rotate(${a.rot}) scale(${esc})" ${pintura(a.relleno)} stroke-width="${(5 / esc).toFixed(2)}" stroke-linejoin="round">` +
      `${FORMAS[a.forma].dibujo}</g></svg>`;
  }

  function itemFigura(a) {
    const at = {
      forma: a.forma,
      relleno: !!a.relleno,
      tam: a.tam === undefined ? TAM_MAX : a.tam,
      rot: FORMAS[a.forma].asim ? mod(a.rot || 0, 360) : 0
    };
    return { key: `fig:${at.forma}:${at.relleno ? 1 : 0}:${at.tam}:${at.rot}`, html: figuraSVG(at), attrs: at };
  }

  // ===== DIBUJO SVG: FLECHAS =====
  function flechaSVG(a) {
    return `<svg viewBox="-50 -50 100 100" role="img" aria-label="flecha ${a.relleno ? 'llena' : 'vacía'} a ${a.ang} grados">` +
      `<g transform="rotate(${a.ang})"><polygon ${pintura(a.relleno)} stroke-width="5" stroke-linejoin="round" ` +
      `points="0,-42 27,-8 11,-8 11,40 -11,40 -11,-8 -27,-8"/></g></svg>`;
  }
  function itemFlecha(a) {
    const at = { ang: mod(a.ang, 360), relleno: !!a.relleno };
    return { key: `fle:${at.ang}:${at.relleno ? 1 : 0}`, html: flechaSVG(at), attrs: at };
  }

  // ===== DIBUJO SVG: RELOJES =====
  function textoHora(t) {
    const h = Math.floor(t / 60) % 12 || 12;
    const m = t % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
  }
  function relojSVG(t) {
    const angHora = (t / 720) * 360;
    const angMin = ((t % 60) / 60) * 360;
    let marcas = '';
    for (let i = 0; i < 12; i++) {
      const principal = i % 3 === 0;
      marcas += `<line x1="0" y1="${principal ? -35 : -38}" x2="0" y2="-43" transform="rotate(${i * 30})" ` +
        `stroke="${AZUL}" stroke-width="${principal ? 4 : 2}" stroke-linecap="round"/>`;
    }
    return `<svg viewBox="-50 -50 100 100" role="img" aria-label="reloj que marca las ${textoHora(t)}">` +
      `<circle r="47" fill="#FFFFFF" stroke="${AZUL}" stroke-width="4"/>${marcas}` +
      `<line x1="0" y1="0" x2="0" y2="-23" transform="rotate(${angHora.toFixed(2)})" stroke="${AZUL}" stroke-width="7" stroke-linecap="round"/>` +
      `<line x1="0" y1="0" x2="0" y2="-35" transform="rotate(${angMin.toFixed(2)})" stroke="${AMBAR}" stroke-width="4" stroke-linecap="round"/>` +
      `<circle r="4.5" fill="${AZUL}"/></svg>`;
  }
  function itemReloj(t) {
    const tt = mod(t, 720);
    return { key: 'rel:' + tt, html: relojSVG(tt), attrs: { t: tt } };
  }

  // ---------- NÚMEROS (niveles 1-3) ----------
  function generateIncreasingDiff() {
    const start = randInt(1, 10);
    const initialDiff = randInt(1, 4);
    const step = randInt(1, 2);
    const len = randInt(5, 7);

    const seq = [start];
    let diff = initialDiff;
    for (let i = 1; i < len; i++) {
      seq.push(seq[i - 1] + diff);
      diff += step;
    }
    const last = seq[len - 1];
    const answer = last + diff;

    const diffs = [];
    for (let i = 1; i < seq.length; i++) diffs.push(`+${seq[i] - seq[i - 1]}`);
    diffs.push(`+${diff}`);

    return {
      sequence: seq.map(itemNumero),
      answer: itemNumero(answer),
      plausibles: itemsNumeros([
        last + diff - step,
        last + diff + step,
        last + initialDiff,
        answer + 1, answer - 1
      ]),
      extra: () => itemNumero(Math.max(1, answer + randInt(1, Math.max(6, Math.floor(answer * 0.3))) * pick([1, -1]))),
      hint: 'Observa cómo cambia la diferencia entre cada par de números consecutivos.',
      explanation: `Las diferencias entre términos consecutivos son: ${diffs.join(', ')}. ` +
        `Cada diferencia ${step === 1 ? 'aumenta en 1' : `aumenta de ${step} en ${step}`}. ` +
        `El siguiente número es ${last} + ${diff} = ${answer}.`
    };
  }

  function generateMultSubAlt() {
    let seq, mult, sub, len, answer;
    do {
      const start = randInt(2, 6);
      mult = randInt(2, 3);
      sub = randInt(1, 3);
      len = randInt(5, 7);
      seq = [start];
      for (let i = 1; i < len; i++) {
        seq.push(i % 2 === 1 ? seq[i - 1] * mult : seq[i - 1] - sub);
      }
      answer = len % 2 === 1 ? seq[len - 1] * mult : seq[len - 1] - sub;
    } while (seq.some(n => n <= 0) || answer <= 0 || answer > 999);

    const last = seq[len - 1];
    const toca = len % 2 === 1 ? 'mult' : 'resta';
    const explanation = `La regla alterna entre multiplicar por ${mult} y restar ${sub} (×${mult}, −${sub}, ×${mult}, −${sub}…). ` +
      (toca === 'mult'
        ? `El siguiente paso es multiplicar: ${last} × ${mult} = ${answer}.`
        : `El siguiente paso es restar: ${last} − ${sub} = ${answer}.`);

    return {
      sequence: seq.map(itemNumero),
      answer: itemNumero(answer),
      plausibles: itemsNumeros([
        toca === 'mult' ? last - sub : last * mult,
        last + sub, last + mult,
        last * mult - sub,
        answer + 1, answer - 1
      ]),
      extra: () => itemNumero(Math.max(1, answer + randInt(1, Math.max(6, Math.floor(answer * 0.3))) * pick([1, -1]))),
      hint: 'Busca un patrón que combine dos operaciones diferentes de forma alternada.',
      explanation
    };
  }

  function generateInterleaved() {
    let serA, serB, stepA, stepB, addA, addB, pairs;
    do {
      const startA = randInt(2, 10);
      const startB = randInt(15, 30);
      stepA = randInt(2, 5);
      stepB = randInt(2, 5);
      addA = Math.random() < 0.5;
      addB = !addA;
      pairs = randInt(3, 4);
      serA = [startA];
      serB = [startB];
      for (let i = 1; i <= pairs; i++) {
        serA.push(addA ? serA[i - 1] + stepA : serA[i - 1] - stepA);
        serB.push(addB ? serB[i - 1] + stepB : serB[i - 1] - stepB);
      }
    } while ([...serA, ...serB].some(n => n <= 0));

    const seq = [];
    for (let i = 0; i < pairs; i++) {
      seq.push(serA[i]);
      seq.push(serB[i]);
    }
    const answer = serA[pairs];
    const opA = addA ? `suman ${stepA}` : `restan ${stepA}`;
    const opB = addB ? `suman ${stepB}` : `restan ${stepB}`;

    return {
      sequence: seq.map(itemNumero),
      answer: itemNumero(answer),
      plausibles: itemsNumeros([
        serB[pairs],
        addA ? serA[pairs - 1] - stepA : serA[pairs - 1] + stepA,
        seq[seq.length - 1] + (addA ? stepA : -stepA),
        answer + 1, answer - 1
      ]),
      extra: () => itemNumero(Math.max(1, answer + randInt(1, 8) * pick([1, -1]))),
      hint: 'Puede que haya dos patrones independientes mezclados en una sola sucesión.',
      explanation: `Hay dos series entrelazadas. ` +
        `Posiciones impares (${serA.slice(0, pairs).join(', ')}): ${opA}. ` +
        `Posiciones pares (${serB.slice(0, pairs).join(', ')}): ${opB}. ` +
        `El siguiente número corresponde a la serie de posiciones impares: ${serA[pairs - 1]} ${addA ? '+' : '−'} ${stepA} = ${answer}.`
    };
  }

  // ---------- LETRAS (niveles 4-6) ----------
  function generateLetrasSaltoConstante() {
    let idx, salto, dir;
    do {
      salto = randInt(2, 4);
      dir = pick([1, -1]);
      const inicio = randInt(0, ALFABETO.length - 1);
      idx = [];
      for (let i = 0; i <= 5; i++) idx.push(inicio + dir * salto * i);
    } while (!letrasValidas(idx));

    const visibles = idx.slice(0, 5);
    const resp = idx[5];
    const last = visibles[4];
    return {
      sequence: visibles.map(itemLetra),
      answer: itemLetra(resp),
      plausibles: itemsLetras([
        resp + 1, resp - 1,
        last + dir * (salto - 1),
        last + dir * (salto + 1),
        last - dir * salto,
        last + dir * salto * 2
      ]),
      extra: () => itemLetra(randInt(0, ALFABETO.length - 1)),
      hint: 'Cuenta cuántas letras del alfabeto hay entre una letra y la siguiente.',
      explanation: `Cada letra ${dir === 1 ? 'avanza' : 'retrocede'} ${salto} lugares en el alfabeto: ` +
        `${visibles.map(i => ALFABETO[i]).join(', ')}. La siguiente es ${ALFABETO[resp]}.`
    };
  }

  function generateLetrasSaltosAlternados() {
    let idx, a, b, signoB;
    do {
      a = randInt(2, 5);
      b = randInt(1, 4);
      signoB = pick([1, -1]);
      if (a === b) continue;
      const inicio = randInt(0, ALFABETO.length - 1);
      idx = [inicio];
      for (let i = 1; i <= 6; i++) idx.push(idx[i - 1] + (i % 2 === 1 ? a : signoB * b));
    } while (a === b || !letrasValidas(idx));

    const visibles = idx.slice(0, 6);
    const resp = idx[6];
    const last = visibles[5];
    return {
      sequence: visibles.map(itemLetra),
      answer: itemLetra(resp),
      plausibles: itemsLetras([
        last + a,
        last - signoB * b,
        last + signoB * b + signoB,
        resp + 1, resp - 1,
        last - a
      ]),
      extra: () => itemLetra(randInt(0, ALFABETO.length - 1)),
      hint: 'Los saltos entre letras no son siempre iguales: fíjate si se alternan.',
      explanation: `Los saltos se alternan: +${a}, ${signoB === 1 ? '+' : '−'}${b}, +${a}, ${signoB === 1 ? '+' : '−'}${b}… ` +
        `Tras +${a} toca ${signoB === 1 ? '+' : '−'}${b}: ${ALFABETO[last]} ${signoB === 1 ? '→' : '←'} ${ALFABETO[resp]}.`
    };
  }

  function generateLetrasIntercaladas() {
    let serA, serB, pA, pB, dirA, dirB, pairs;
    do {
      pA = randInt(1, 3); pB = randInt(1, 3);
      dirA = pick([1, -1]); dirB = pick([1, -1]);
      pairs = randInt(3, 4);
      const iniA = randInt(0, 10);
      const iniB = randInt(14, 26);
      serA = []; serB = [];
      for (let i = 0; i <= pairs; i++) {
        serA.push(iniA + dirA * pA * i);
        serB.push(iniB + dirB * pB * i);
      }
    } while (!letrasValidas(serA) || !letrasValidas(serB));

    const seq = [];
    for (let i = 0; i < pairs; i++) { seq.push(serA[i]); seq.push(serB[i]); }
    const resp = serA[pairs];
    const nom = (v, p) => `${v === 1 ? 'avanza' : 'retrocede'} ${p} ${p === 1 ? 'lugar' : 'lugares'}`;
    return {
      sequence: seq.map(itemLetra),
      answer: itemLetra(resp),
      plausibles: itemsLetras([
        serB[pairs],
        serA[pairs - 1] - dirA * pA,
        resp + 1, resp - 1,
        seq[seq.length - 1] + dirA * pA
      ]),
      extra: () => itemLetra(randInt(0, ALFABETO.length - 1)),
      hint: 'Separa las letras de posiciones impares y pares: pueden seguir reglas distintas.',
      explanation: `Hay dos series entrelazadas. Posiciones impares (${serA.slice(0, pairs).map(i => ALFABETO[i]).join(', ')}): cada letra ${nom(dirA, pA)}. ` +
        `Posiciones pares (${serB.slice(0, pairs).map(i => ALFABETO[i]).join(', ')}): cada letra ${nom(dirB, pB)}. ` +
        `La que falta es de la serie impar: ${ALFABETO[resp]}.`
    };
  }

  // ---------- FIGURAS (niveles 7-9) ----------
  function generateFigurasRepeticion() {
    const formas = shuffle(FORMAS_BASICAS);
    const ciclo = formas.slice(0, 3);
    const extraForma = formas[3];
    const relleno = Math.random() < 0.5;
    const visibles = randInt(6, 7);
    const forma = i => ciclo[i % 3];

    const resp = forma(visibles);
    return {
      sequence: Array.from({ length: visibles }, (_, i) => itemFigura({ forma: forma(i), relleno })),
      answer: itemFigura({ forma: resp, relleno }),
      plausibles: [
        ...ciclo.filter(f => f !== resp).map(f => itemFigura({ forma: f, relleno })),
        itemFigura({ forma: extraForma, relleno }),
        itemFigura({ forma: resp, relleno: !relleno })
      ],
      extra: () => itemFigura({ forma: pick(FORMAS_BASICAS), relleno: pick([true, false]) }),
      hint: 'Mira si la misma serie de formas se repite una y otra vez.',
      explanation: `Las formas se repiten en grupos de tres: ${ciclo.map(f => FORMAS[f].nombre).join(', ')}. ` +
        `Después de ${FORMAS[forma(visibles - 1)].nombre} viene ${FORMAS[resp].nombre}.`
    };
  }

  function generateFigurasTamanoRelleno() {
    const forma = pick(FORMAS_BASICAS);
    const crece = Math.random() < 0.5;
    const rellenoInicial = Math.random() < 0.5;
    const tam = i => (crece ? i : TAM_MAX - i);
    const relleno = i => (i % 2 === 0 ? rellenoInicial : !rellenoInicial);
    const visibles = 5;
    const r = visibles;

    const mk = (t, f) => itemFigura({ forma, tam: t, relleno: f });
    return {
      sequence: Array.from({ length: visibles }, (_, i) => mk(tam(i), relleno(i))),
      answer: mk(tam(r), relleno(r)),
      plausibles: [
        mk(tam(r), !relleno(r)),
        mk(tam(r - 1), relleno(r)),
        mk(tam(r - 1), !relleno(r)),
        mk(tam(r - 2), relleno(r))
      ],
      extra: () => mk(randInt(0, TAM_MAX), pick([true, false])),
      hint: 'Fíjate en dos cosas a la vez: el tamaño de la figura y si está llena o vacía.',
      explanation: `La figura ${crece ? 'crece' : 'se reduce'} un paso cada vez y el relleno alterna entre lleno y vacío. ` +
        `La siguiente es ${crece ? 'aún más grande' : 'aún más pequeña'} y está ${relleno(r) ? 'llena' : 'vacía'}.`
    };
  }

  function generateFigurasGiroRelleno() {
    const dir = pick([1, -1]);
    const rot0 = pick([0, 90, 180, 270]);
    const rellenoInicial = Math.random() < 0.5;
    const formas = shuffle(['trirect', 'semicirculo']);
    const visibles = 6;
    const r = visibles;

    const rot = i => rot0 + dir * 90 * i;
    const relleno = i => (i % 2 === 0 ? rellenoInicial : !rellenoInicial);
    const forma = i => formas[i % 2];
    const mk = (f, ro, re) => itemFigura({ forma: f, rot: ro, relleno: re });

    return {
      sequence: Array.from({ length: visibles }, (_, i) => mk(forma(i), rot(i), relleno(i))),
      answer: mk(forma(r), rot(r), relleno(r)),
      plausibles: [
        mk(forma(r), rot(r - 1) + 180, relleno(r)),
        mk(forma(r), rot(r - 1) - dir * 90, relleno(r)),
        mk(forma(r), rot(r), !relleno(r)),
        mk(forma(r + 1), rot(r), relleno(r)),
        mk(forma(r + 1), rot(r), !relleno(r)),
        mk(forma(r + 1), rot(r) + 90, relleno(r))
      ],
      extra: () => mk(pick(formas), pick([0, 90, 180, 270]), pick([true, false])),
      hint: 'Hay tres cambios a la vez: el giro, el relleno y la forma.',
      explanation: `Cada figura gira 90° en sentido ${dir === 1 ? 'horario' : 'antihorario'}, alterna entre lleno y vacío ` +
        `y también alterna entre ${FORMAS[formas[0]].nombre} y ${FORMAS[formas[1]].nombre}. ` +
        `La siguiente es un ${FORMAS[forma(r)].nombre} ${relleno(r) ? 'lleno' : 'vacío'} girado ${mod(rot(r), 360)}° respecto a la posición original.`
    };
  }

  // ---------- FLECHAS (niveles 10-12) ----------
  function generateFlechasGiro() {
    const paso = pick([45, 90, 135]);
    const dir = pick([1, -1]);
    const ang0 = randInt(0, 7) * 45;
    const visibles = 5;
    const ang = i => ang0 + dir * paso * i;
    const mk = (a, f = true) => itemFlecha({ ang: a, relleno: f });
    const r = visibles;

    return {
      sequence: Array.from({ length: visibles }, (_, i) => mk(ang(i))),
      answer: mk(ang(r)),
      plausibles: [
        mk(ang(r) + 45), mk(ang(r) - 45),
        mk(ang(r - 1)),
        mk(ang(r - 1) - dir * paso),
        mk(ang(r) + 180),
        mk(ang(r), false)
      ],
      extra: () => mk(randInt(0, 7) * 45, pick([true, false])),
      hint: 'Mide cuánto gira la flecha de un paso al siguiente.',
      explanation: `Cada flecha gira ${paso}° en sentido ${dir === 1 ? 'horario' : 'antihorario'} respecto a la anterior. ` +
        `La siguiente apunta a ${mod(ang(r), 360)}° (medidos desde arriba, en sentido horario).`
    };
  }

  function generateFlechasAlternando() {
    let a, b;
    do {
      a = pick([90, 135, 180]);
      b = pick([45, 90]);
    } while (a === b);
    const signo = pick([1, -1]);
    const ang0 = randInt(0, 7) * 45;
    const visibles = 6;
    const ang = [ang0];
    for (let i = 1; i <= visibles; i++) ang.push(ang[i - 1] + (i % 2 === 1 ? signo * a : -signo * b));
    const mk = (g, f = true) => itemFlecha({ ang: g, relleno: f });
    const last = ang[visibles - 1];
    const resp = ang[visibles];

    return {
      sequence: ang.slice(0, visibles).map(g => mk(g)),
      answer: mk(resp),
      plausibles: [
        mk(last + signo * a),
        mk(last + signo * b),
        mk(last - signo * a),
        mk(resp + 45), mk(resp - 45),
        mk(resp, false)
      ],
      extra: () => mk(randInt(0, 7) * 45, pick([true, false])),
      hint: 'El giro no es siempre igual: puede cambiar de tamaño y de sentido en cada paso.',
      explanation: `Los giros se alternan: ${a}° ${signo === 1 ? 'horario' : 'antihorario'}, luego ${b}° ${signo === 1 ? 'antihorario' : 'horario'}, y así sucesivamente. ` +
        `Después de un giro de ${a}° toca uno de ${b}° en sentido contrario, así que la flecha apunta a ${mod(resp, 360)}°.`
    };
  }

  function generateFlechasGiroRelleno() {
    const paso = pick([45, 90, 135]);
    const dir = pick([1, -1]);
    const ang0 = randInt(0, 7) * 45;
    const base = [true, false, false];
    const fase = randInt(0, 2);
    const visibles = 6;
    const ang = i => ang0 + dir * paso * i;
    const relleno = i => base[(i + fase) % 3];
    const mk = (g, f) => itemFlecha({ ang: g, relleno: f });
    const r = visibles;

    return {
      sequence: Array.from({ length: visibles }, (_, i) => mk(ang(i), relleno(i))),
      answer: mk(ang(r), relleno(r)),
      plausibles: [
        mk(ang(r), !relleno(r)),
        mk(ang(r) + 45, relleno(r)),
        mk(ang(r) - 45, relleno(r)),
        mk(ang(r - 1) - dir * paso, relleno(r)),
        mk(ang(r - 1), relleno(r)),
        mk(ang(r - 1) - dir * paso, !relleno(r))
      ],
      extra: () => mk(randInt(0, 7) * 45, pick([true, false])),
      hint: 'Observa dos reglas independientes: el giro y el patrón de relleno.',
      explanation: `La flecha gira ${paso}° en sentido ${dir === 1 ? 'horario' : 'antihorario'} en cada paso. ` +
        `El relleno sigue un patrón de tres (lleno, vacío, vacío) que se repite. ` +
        `La siguiente apunta a ${mod(ang(r), 360)}° y está ${relleno(r) ? 'llena' : 'vacía'}.`
    };
  }

  // ---------- RELOJES (niveles 13-15) ----------
  function plausiblesReloj(ultimo, paso, resp) {
    return [
      itemReloj(ultimo + 2 * paso),
      itemReloj(ultimo),
      itemReloj(resp + 60), itemReloj(resp - 60),
      itemReloj(resp + 15), itemReloj(resp - 15),
      itemReloj(resp + 5)
    ];
  }
  const relojAleatorio = () => itemReloj(randInt(0, 143) * 5);

  function generarRelojConstante(paso, hint) {
    const t0 = randInt(0, 143) * 5;
    const visibles = 5;
    const seq = Array.from({ length: visibles }, (_, i) => itemReloj(t0 + paso * i));
    const ultimo = t0 + paso * (visibles - 1);
    const resp = t0 + paso * visibles;
    const horas = Math.floor(paso / 60), mins = paso % 60;
    const cuanto = horas ? `${horas} hora${mins ? ` y ${mins} minutos` : ''}` : `${mins} minutos`;
    return {
      sequence: seq,
      answer: itemReloj(resp),
      plausibles: plausiblesReloj(ultimo, paso, resp),
      extra: relojAleatorio,
      hint,
      explanation: `Cada reloj avanza ${cuanto}: ${seq.map(s => textoHora(s.attrs.t)).join(', ')}. ` +
        `El siguiente marca las ${textoHora(mod(resp, 720))}.`
    };
  }

  function generateRelojMedia() {
    return generarRelojConstante(30, 'Compara la posición de las dos manecillas entre un reloj y el siguiente.');
  }

  function generateRelojSalto() {
    return generarRelojConstante(pick([45, 75]), 'Calcula cuánto tiempo pasa entre un reloj y el siguiente.');
  }

  function generateRelojCombinado() {
    const pasoHora = pick([1, 2]);
    const [m1, m2] = shuffle([0, 15, 30, 45]).slice(0, 2);
    const h0 = randInt(0, 11);
    const visibles = 6;
    const hora = i => h0 + pasoHora * i;
    const minu = i => (i % 2 === 0 ? m1 : m2);
    const t = i => mod(hora(i), 12) * 60 + minu(i);
    const r = visibles;

    return {
      sequence: Array.from({ length: visibles }, (_, i) => itemReloj(t(i))),
      answer: itemReloj(t(r)),
      plausibles: [
        itemReloj(mod(hora(r), 12) * 60 + minu(r + 1)),
        itemReloj(mod(hora(r - 1), 12) * 60 + minu(r)),
        itemReloj(mod(hora(r + 1), 12) * 60 + minu(r)),
        itemReloj(mod(hora(r) + 1, 12) * 60 + minu(r))
      ],
      extra: relojAleatorio,
      hint: 'La hora y los minutos siguen reglas distintas: obsérvalas por separado.',
      explanation: `La hora avanza ${pasoHora} ${pasoHora === 1 ? 'hora' : 'horas'} en cada reloj, mientras los minutos se alternan entre :${String(m1).padStart(2, '0')} y :${String(m2).padStart(2, '0')}. ` +
        `Relojes: ${Array.from({ length: visibles }, (_, i) => textoHora(t(i))).join(', ')}. El siguiente marca las ${textoHora(t(r))}.`
    };
  }

  const GENERADORES = [
    generateIncreasingDiff, generateMultSubAlt, generateInterleaved,
    generateLetrasSaltoConstante, generateLetrasSaltosAlternados, generateLetrasIntercaladas,
    generateFigurasRepeticion, generateFigurasTamanoRelleno, generateFigurasGiroRelleno,
    generateFlechasGiro, generateFlechasAlternando, generateFlechasGiroRelleno,
    generateRelojMedia, generateRelojSalto, generateRelojCombinado
  ];

  function categoriaDeNivel(nivel) {
    return CATEGORIAS[Math.floor((nivel - 1) / NIVELES_POR_CATEGORIA)];
  }

  function elegirDistractores(g) {
    const vistos = new Set([g.answer.key]);
    const elegidos = [];
    const agregar = it => {
      if (!vistos.has(it.key)) { vistos.add(it.key); elegidos.push(it); }
    };
    for (const it of shuffle(g.plausibles)) {
      if (elegidos.length === 3) break;
      agregar(it);
    }
    let intentos = 0;
    while (elegidos.length < 3) {
      if (++intentos > 500) throw new Error('No se pudieron generar 3 distractores');
      agregar(g.extra());
    }
    return elegidos;
  }

  function generarPregunta(nivel) {
    const g = GENERADORES[nivel - 1]();
    const cat = categoriaDeNivel(nivel);
    return {
      nivel,
      categoria: cat.id,
      grafico: cat.grafico,
      hint: g.hint,
      explanation: g.explanation,
      sequence: g.sequence,
      answer: g.answer,
      options: shuffle([g.answer, ...elegirDistractores(g)])
    };
  }

  function generarPrueba() {
    const preguntas = [];
    for (let nivel = 1; nivel <= TOTAL_NIVELES; nivel++) {
      for (let k = 0; k < PREGUNTAS_POR_NIVEL; k++) preguntas.push(generarPregunta(nivel));
    }
    return preguntas;
  }

  // ===== RENDER =====
  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
    window.scrollTo(0, 0);
  }

  function renderSequence(q) {
    const container = $('sequence-display');
    container.innerHTML = '';
    container.classList.toggle('sequence-display--grafico', q.grafico);

    const crearComa = () => {
      const comma = document.createElement('span');
      comma.className = 'seq-comma';
      comma.textContent = ',';
      return comma;
    };

    q.sequence.forEach((item, i) => {
      const el = document.createElement(q.grafico ? 'div' : 'span');
      el.className = q.grafico ? 'seq-item' : 'seq-num';
      el.style.animationDelay = `${0.05 * (i + 1)}s`;
      el.innerHTML = item.html;
      container.appendChild(el);
      if (!q.grafico) container.appendChild(crearComa());
    });

    const unknown = document.createElement(q.grafico ? 'div' : 'span');
    unknown.className = 'seq-unknown' + (q.grafico ? ' seq-unknown--grafico' : '');
    unknown.style.animationDelay = `${0.05 * (q.sequence.length + 1)}s`;
    unknown.textContent = '?';
    container.appendChild(unknown);
  }

  function renderOptions(q) {
    const letters = ['A', 'B', 'C', 'D'];
    const grid = $('options-grid');
    grid.innerHTML = '';
    grid.className = 'options-grid ' + (q.grafico ? 'options-grid--grafico' : 'options-grid--texto');

    q.options.forEach((item, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <span class="option-btn__letter">${letters[i]}</span>
        <span class="option-btn__value">${item.html}</span>
      `;
      btn.dataset.key = item.key;
      btn.addEventListener('click', () => handleAnswer(btn, item, q));
      grid.appendChild(btn);
    });
  }

  // ===== TEMPORIZADOR =====
  function startTimer() {
    state.questionStartTime = Date.now();
    const timerEl = $('timer');
    const timerText = $('timer-text');
    timerEl.className = 'quiz-timer';
    timerText.textContent = '00:00';

    if (state.timerInterval) clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - state.questionStartTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      timerText.textContent = `${mins}:${secs}`;

      if (elapsed >= 60) timerEl.className = 'quiz-timer danger';
      else if (elapsed >= 30) timerEl.className = 'quiz-timer warning';
      else timerEl.className = 'quiz-timer';
    }, 250);
  }

  function stopTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    return Date.now() - state.questionStartTime;
  }

  // ===== RETROALIMENTACIÓN =====
  function showFeedback(correct) {
    const el = $('feedback');
    el.className = `feedback ${correct ? 'feedback--correct' : 'feedback--wrong'}`;
    el.innerHTML = correct
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> ¡Correcto!`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Incorrecto`;
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => el.classList.remove('show'), 2000);
  }

  // ===== RESPUESTA DEL USUARIO =====
  function handleAnswer(btnEl, selected, q) {
    if (state.answered) return;
    state.answered = true;

    const elapsed = stopTimer();
    const isCorrect = selected.key === q.answer.key;

    if (isCorrect) {
      state.correctCount++;
      btnEl.classList.add('correct');
    } else {
      state.wrongCount++;
      btnEl.classList.add('wrong');
      document.querySelectorAll('.option-btn').forEach(b => {
        if (b.dataset.key === q.answer.key) b.classList.add('correct');
        else if (b !== btnEl) b.classList.add('disabled');
      });
    }

    $('stat-correct').textContent = state.correctCount;
    $('stat-wrong').textContent = state.wrongCount;

    showFeedback(isCorrect);

    state.results.push({ nivel: q.nivel, categoria: q.categoria, correct: isCorrect, timeMs: elapsed });

    $('explanation-text').textContent = q.explanation;
    $('explanation').style.display = 'block';

    const esUltima = state.currentQuestion === state.questions.length - 1;
    const nextBtn = $('btn-next');
    nextBtn.innerHTML = esUltima
      ? `Ver Resultados <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
      : `Siguiente <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
    nextBtn.style.display = 'inline-flex';
  }

  // ===== PANTALLA DE INICIO DE NIVEL =====
  function showLevelIntro(nivel) {
    const cat = categoriaDeNivel(nivel);
    const posEnCat = ((nivel - 1) % NIVELES_POR_CATEGORIA) + 1;
    $('level-badge').textContent = `Nivel ${nivel} de ${TOTAL_NIVELES}`;
    $('level-title').textContent = `Nivel ${nivel} · ${cat.nombre}`;
    $('level-desc').textContent = `${cat.descripcion} Este es el nivel ${posEnCat} de ${NIVELES_POR_CATEGORIA} de la categoría; tendrás ${PREGUNTAS_POR_NIVEL} pruebas.`;

    const idxCat = CATEGORIAS.indexOf(cat);
    $('level-steps').innerHTML = CATEGORIAS.map((c, i) =>
      `<span class="level-steps__chip ${i < idxCat ? 'done' : i === idxCat ? 'current' : ''}">${c.nombre}</span>`
    ).join('');

    showScreen('level');
  }

  // ===== CARGAR PREGUNTA =====
  function loadQuestion(index) {
    state.answered = false;
    $('explanation').style.display = 'none';
    $('btn-next').style.display = 'none';

    const q = state.questions[index];
    const cat = categoriaDeNivel(q.nivel);
    const k = (index % PREGUNTAS_POR_NIVEL) + 1;
    $('q-label').textContent = `Nivel ${q.nivel}/${TOTAL_NIVELES} · ${cat.nombre} · Pregunta ${k}/${PREGUNTAS_POR_NIVEL}`;
    $('q-hint').textContent = `Pista: ${q.hint}`;
    $('progress-label').textContent = `Pregunta ${index + 1} / ${state.questions.length}`;
    $('progress-fill').style.width = `${(index / state.questions.length) * 100}%`;

    showScreen('quiz');
    renderSequence(q);
    renderOptions(q);
    startTimer();
  }

  // ===== RESULTADOS =====
  function formatearTiempo(ms) {
    const totalSec = Math.round(ms / 1000);
    return totalSec >= 60 ? `${Math.floor(totalSec / 60)}m ${totalSec % 60}s` : `${totalSec}s`;
  }

  function calcularDetalle() {
    const categorias = CATEGORIAS.map(cat => {
      const rs = state.results.filter(r => r.categoria === cat.id);
      const tiempo = rs.reduce((s, r) => s + r.timeMs, 0);
      return {
        categoria: cat.id,
        aciertos: rs.filter(r => r.correct).length,
        total: NIVELES_POR_CATEGORIA * PREGUNTAS_POR_NIVEL,
        tiempoMedioMs: rs.length ? Math.round(tiempo / rs.length) : 0
      };
    });
    const niveles = [];
    for (let nivel = 1; nivel <= TOTAL_NIVELES; nivel++) {
      const rs = state.results.filter(r => r.nivel === nivel);
      niveles.push({
        nivel,
        categoria: categoriaDeNivel(nivel).id,
        aciertos: rs.filter(r => r.correct).length,
        total: PREGUNTAS_POR_NIVEL
      });
    }
    return { categorias, niveles };
  }

  function showResults() {
    showScreen('results');

    const total = state.questions.length;
    const correct = state.correctCount;
    const wrong = state.wrongCount;
    const totalTime = state.results.reduce((s, r) => s + r.timeMs, 0);

    $('res-correct').textContent = correct;
    $('res-wrong').textContent = wrong;
    $('res-time').textContent = formatearTiempo(totalTime);

    if (correct === total) {
      $('results-emoji').textContent = '🏆';
      $('results-title').textContent = '¡Perfecto!';
      $('results-message').textContent = 'Acertaste las 45 pruebas. ¡Eres un maestro de los patrones!';
      spawnConfetti();
    } else if (correct >= Math.ceil(total / 2)) {
      $('results-emoji').textContent = '🎯';
      $('results-title').textContent = '¡Buen trabajo!';
      $('results-message').textContent = 'Acertaste la mayoría. Con más práctica serás imparable.';
    } else {
      $('results-emoji').textContent = '💪';
      $('results-title').textContent = 'Sigue practicando';
      $('results-message').textContent = 'Los patrones son difíciles, pero cada intento te acerca más. ¡Vuelve a intentarlo!';
    }

    const detalle = calcularDetalle();
    const detailContainer = $('results-detail');
    const titleEl = detailContainer.querySelector('.results-detail__title');
    detailContainer.innerHTML = '';
    detailContainer.appendChild(titleEl);

    detalle.categorias.forEach((c, i) => {
      const cat = CATEGORIAS[i];
      const porNivel = detalle.niveles
        .filter(n => n.categoria === c.categoria)
        .map(n => `N${n.nivel}: ${n.aciertos}/${n.total}`)
        .join(' · ');
      const row = document.createElement('div');
      row.className = 'detail-row';
      row.innerHTML = `
        <div class="detail-row__left">
          <span class="detail-row__name">${cat.nombre}<small>${porNivel}</small></span>
        </div>
        <div style="text-align:right">
          <div class="detail-row__score">${c.aciertos}/${c.total}</div>
          <span class="detail-row__time">⌀ ${(c.tiempoMedioMs / 1000).toFixed(1)}s</span>
        </div>
      `;
      detailContainer.appendChild(row);
    });

    if (state.enviado) return;
    state.enviado = true;
    const puntaje = Math.round((correct / total) * 100);
    enviarResultadoAlServidor({
      prueba: 'razonamiento',
      puntaje,
      precisionPct: puntaje,
      tiempoMs: totalTime,
      errores: wrong,
      detalle
    });
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

  // ===== CONFETI =====
  function spawnConfetti() {
    const container = $('confetti');
    container.innerHTML = '';
    const colors = ['#1A3560', '#C97B2E', '#1E9E63', '#24427A', '#E0A060', '#6B7280'];
    for (let i = 0; i < 80; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
      piece.style.animationDelay = `${Math.random() * .6}s`;
      piece.style.width = `${6 + Math.random() * 6}px`;
      piece.style.height = `${10 + Math.random() * 8}px`;
      container.appendChild(piece);
    }
    setTimeout(() => container.innerHTML = '', 4000);
  }

  // ===== INICIO DEL JUEGO =====
  function initGame() {
    state.currentQuestion = 0;
    state.correctCount = 0;
    state.wrongCount = 0;
    state.results = [];
    state.answered = false;
    state.enviado = false;
    $('stat-correct').textContent = '0';
    $('stat-wrong').textContent = '0';

    state.questions = generarPrueba();
    showLevelIntro(1);
  }

  // ===== EVENTOS =====
  $('btn-start').addEventListener('click', initGame);
  $('btn-level-start').addEventListener('click', () => loadQuestion(state.currentQuestion));
  $('btn-next').addEventListener('click', () => {
    state.currentQuestion++;
    if (state.currentQuestion >= state.questions.length) {
      showResults();
    } else if (state.currentQuestion % PREGUNTAS_POR_NIVEL === 0) {
      showLevelIntro(state.questions[state.currentQuestion].nivel);
    } else {
      loadQuestion(state.currentQuestion);
    }
  });
};

