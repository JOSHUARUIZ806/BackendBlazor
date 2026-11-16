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
    // 3 fases x 5 niveles = 15 niveles en total (1 pregunta por nivel).
    const PREGUNTAS_POR_NIVEL = 1;
    const NIVELES_POR_CATEGORIA = 5;
    const TOTAL_NIVELES = 15;
    const TOTAL_PREGUNTAS = TOTAL_NIVELES * PREGUNTAS_POR_NIVEL; // 15

    const CATEGORIAS = [
        {
            id: 'numeros', nombre: 'Números', grafico: false,
            descripcion: 'Descubre el número que falta: observa sumas, diferencias crecientes, operaciones alternadas y series entrelazadas.'
        },
        {
            id: 'letras', nombre: 'Letras', grafico: false,
            descripcion: 'Usa el orden del alfabeto español (incluye la Ñ) para encontrar la letra que falta.'
        },
        {
            id: 'flechas', nombre: 'Flechas (90°)', grafico: true,
            descripcion: 'Fíjate hacia dónde gira cada flecha en pasos de 90° (sentido horario o antihorario) y en su relleno.'
        }
    ];

    // ===== ESTADO DE LA APLICACIÓN =====
    const state = {
        currentQuestion: 0,   // índice global del nivel (0-14)
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

    // ===== DIBUJO SVG: FLECHAS (giros de 90°) =====
    const AZUL = '#1A3560';
    function pintura(relleno) {
        return relleno
            ? `fill="${AZUL}" stroke="${AZUL}"`
            : `fill="#FFFFFF" stroke="${AZUL}"`;
    }
    function flechaSVG(a) {
        return `<svg viewBox="-50 -50 100 100" role="img" aria-label="flecha ${a.relleno ? 'llena' : 'vacía'} a ${a.ang} grados">` +
            `<g transform="rotate(${a.ang})"><polygon ${pintura(a.relleno)} stroke-width="5" stroke-linejoin="round" ` +
            `points="0,-42 27,-8 11,-8 11,40 -11,40 -11,-8 -27,-8"/></g></svg>`;
    }
    function itemFlecha(a) {
        const at = { ang: mod(a.ang, 360), relleno: !!a.relleno };
        return { key: `fle:${at.ang}:${at.relleno ? 1 : 0}`, html: flechaSVG(at), attrs: at };
    }

    // ======================================================================
    // GENERADORES DE PREGUNTAS (3 fases x 5 niveles = 15 generadores)
    // ======================================================================

    // ---------- FASE 1: NÚMEROS (Niveles 1–5) ----------

    // Nivel 1: diferencia constante (progresión aritmética ascendente o descendente)
    function generateConstantDiff() {
        const step = randInt(2, 6);
        const asc = Math.random() < 0.65;
        const len = 5;
        const start = asc ? randInt(2, 15) : randInt(step * len + 4, step * len + 20);
        const seq = Array.from({ length: len }, (_, i) => start + (asc ? 1 : -1) * step * i);
        const last = seq[len - 1];
        const answer = last + (asc ? 1 : -1) * step;

        return {
            sequence: seq.map(itemNumero),
            answer: itemNumero(answer),
            plausibles: itemsNumeros([
                last + (asc ? -1 : 1) * step,
                answer + 1,
                answer - 1,
                answer + step,
                answer - step
            ]),
            extra: () => itemNumero(Math.max(1, answer + randInt(2, 9) * pick([1, -1]))),
            hint: 'Calcula cuánto se suma o se resta de un número al siguiente.',
            explanation: `En cada paso se ${asc ? 'suma' : 'resta'} ${step}: ${seq.join(', ')}. ` +
                `El siguiente número es ${last} ${asc ? '+' : '−'} ${step} = ${answer}.`
        };
    }

    // Nivel 2: diferencias que crecen en una cantidad fija
    function generateIncreasingDiff() {
        const start = randInt(1, 10);
        const initialDiff = randInt(1, 4);
        const step = randInt(1, 2);
        const len = randInt(5, 6);

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

    // Nivel 3: suma y resta alternadas (+a, −b, +a, −b…)
    function generateAddSubAlt() {
        let seq, a, b, answer;
        const len = 6;
        do {
            a = randInt(4, 8);
            b = randInt(1, a - 1);
            const start = randInt(5, 15);
            seq = [start];
            for (let i = 1; i < len; i++) {
                seq.push(i % 2 === 1 ? seq[i - 1] + a : seq[i - 1] - b);
            }
            answer = len % 2 === 1 ? seq[len - 1] + a : seq[len - 1] - b;
        } while (seq.some(n => n <= 0) || answer <= 0);

        const last = seq[len - 1];
        return {
            sequence: seq.map(itemNumero),
            answer: itemNumero(answer),
            plausibles: itemsNumeros([
                last + a,
                last + b,
                last - a,
                answer + 1, answer - 1
            ]),
            extra: () => itemNumero(Math.max(1, answer + randInt(2, 8) * pick([1, -1]))),
            hint: 'Observa cómo se alternan una suma y una resta en cada paso.',
            explanation: `La regla alterna sumar ${a} y restar ${b} (+${a}, −${b}, +${a}, −${b}…). ` +
                `El siguiente paso es ${last} − ${b} = ${answer}.`
        };
    }

    // Nivel 4: se alterna multiplicar y restar
    function generateMultSubAlt() {
        let seq, mult, sub, len, answer;
        do {
            const start = randInt(2, 6);
            mult = randInt(2, 3);
            sub = randInt(1, 3);
            len = randInt(5, 6);
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
            hint: 'Busca un patrón que combine multiplicar y restar de forma alternada.',
            explanation
        };
    }

    // Nivel 5: dos series entrelazadas (una sube y otra baja)
    function generateInterleaved() {
        let serA, serB, stepA, stepB, addA, addB, pairs;
        do {
            addA = Math.random() < 0.5;
            addB = !addA;
            stepA = randInt(2, 5);
            stepB = randInt(2, 5);
            pairs = 3;
            const startA = addA ? randInt(2, 10) : randInt(18, 30);
            const startB = addB ? randInt(2, 10) : randInt(18, 30);
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
            hint: 'Hay dos patrones independientes mezclados en posiciones impares y pares.',
            explanation: `Hay dos series entrelazadas. ` +
                `Posiciones impares (${serA.slice(0, pairs).join(', ')}): ${opA}. ` +
                `Posiciones pares (${serB.slice(0, pairs).join(', ')}): ${opB}. ` +
                `El siguiente número corresponde a la serie impar: ${serA[pairs - 1]} ${addA ? '+' : '−'} ${stepA} = ${answer}.`
        };
    }

    // ---------- FASE 2: LETRAS (Niveles 6–10) ----------

    // Nivel 6: salto constante ascendente en el alfabeto (+2 o +3)
    function generateLetrasSaltoAscendente() {
        const salto = randInt(2, 3);
        const inicio = randInt(0, ALFABETO.length - 1 - salto * 5);
        const idx = Array.from({ length: 6 }, (_, i) => inicio + salto * i);
        const visibles = idx.slice(0, 5);
        const resp = idx[5];
        const last = visibles[4];

        return {
            sequence: visibles.map(itemLetra),
            answer: itemLetra(resp),
            plausibles: itemsLetras([
                resp + 1, resp - 1,
                last + salto + 1,
                last + 1,
                last + salto * 2
            ]),
            extra: () => itemLetra(randInt(0, ALFABETO.length - 1)),
            hint: 'Cuenta cuántas letras del alfabeto avanzas de una letra a la siguiente.',
            explanation: `Cada letra avanza ${salto} lugares en el alfabeto español: ` +
                `${visibles.map(i => ALFABETO[i]).join(', ')}. La siguiente es ${ALFABETO[resp]}.`
        };
    }

    // Nivel 7: salto constante en el alfabeto (ascendente o descendente, de 2 a 4)
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
            hint: 'Cuenta cuántas letras hay entre una y otra (puede avanzar o retroceder).',
            explanation: `Cada letra ${dir === 1 ? 'avanza' : 'retrocede'} ${salto} lugares en el alfabeto: ` +
                `${visibles.map(i => ALFABETO[i]).join(', ')}. La siguiente es ${ALFABETO[resp]}.`
        };
    }

    // Nivel 8: saltos crecientes en el alfabeto (+1, +2, +3, +4, +5)
    function generateLetrasSaltoCreciente() {
        let idx, dir;
        do {
            dir = pick([1, -1]);
            const inicio = randInt(0, ALFABETO.length - 1);
            idx = [inicio];
            for (let step = 1; step <= 5; step++) {
                idx.push(idx[idx.length - 1] + dir * step);
            }
        } while (!letrasValidas(idx));

        const visibles = idx.slice(0, 5);
        const resp = idx[5];
        const last = visibles[4];
        const s = dir === 1 ? '+' : '−';
        return {
            sequence: visibles.map(itemLetra),
            answer: itemLetra(resp),
            plausibles: itemsLetras([
                last + dir * 4,
                last + dir * 6,
                resp + 1, resp - 1,
                last - dir * 5
            ]),
            extra: () => itemLetra(randInt(0, ALFABETO.length - 1)),
            hint: 'El salto entre letras crece en 1 lugar en cada paso.',
            explanation: `Los saltos en el alfabeto van creciendo (${s}1, ${s}2, ${s}3, ${s}4, ${s}5): ` +
                `${visibles.map(i => ALFABETO[i]).join(', ')}. El siguiente salto es de 5 lugares hasta ${ALFABETO[resp]}.`
        };
    }

    // Nivel 9: saltos alternados (+a, +b, +a, +b…) o (+a, −b, +a, −b…)
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

    // Nivel 10: dos series de letras entrelazadas
    function generateLetrasIntercaladas() {
        let serA, serB, pA, pB, dirA, dirB, pairs;
        do {
            pA = randInt(1, 3); pB = randInt(1, 3);
            dirA = pick([1, -1]); dirB = pick([1, -1]);
            pairs = 3;
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
            hint: 'Separa las letras de posiciones impares y pares: siguen reglas distintas.',
            explanation: `Hay dos series entrelazadas. Posiciones impares (${serA.slice(0, pairs).map(i => ALFABETO[i]).join(', ')}): cada letra ${nom(dirA, pA)}. ` +
                `Posiciones pares (${serB.slice(0, pairs).map(i => ALFABETO[i]).join(', ')}): cada letra ${nom(dirB, pB)}. ` +
                `La que falta es de la serie impar: ${ALFABETO[resp]}.`
        };
    }

    // ---------- FASE 3: FLECHAS QUE GIRAN 90 GRADOS (Niveles 11–15) ----------

    const NOMBRES_DIRECCION = { 0: 'arriba', 90: 'la derecha', 180: 'abajo', 270: 'la izquierda' };

    // Nivel 11: giro constante de 90° (horario o antihorario), todas llenas
    function generateFlechasGiro90() {
        const dir = pick([1, -1]);
        const ang0 = randInt(0, 3) * 90;
        const visibles = 5;
        const ang = i => mod(ang0 + dir * 90 * i, 360);
        const mk = (a, f = true) => itemFlecha({ ang: a, relleno: f });
        const r = visibles;

        return {
            sequence: Array.from({ length: visibles }, (_, i) => mk(ang(i))),
            answer: mk(ang(r)),
            plausibles: [
                mk(ang(r) + 90),
                mk(ang(r) + 180),
                mk(ang(r) + 270)
            ],
            extra: () => mk(randInt(0, 3) * 90, true),
            hint: 'Observa hacia dónde gira la flecha 90° en cada paso (horario o antihorario).',
            explanation: `Cada flecha gira 90° en sentido ${dir === 1 ? 'horario' : 'antihorario'}. ` +
                `La siguiente apunta hacia ${NOMBRES_DIRECCION[ang(r)]} (${ang(r)}°).`
        };
    }

    // Nivel 12: giro constante de 90° + alternancia de relleno (llena, vacía, llena, vacía…)
    function generateFlechasGiro90RellenoAlt() {
        const dir = pick([1, -1]);
        const ang0 = randInt(0, 3) * 90;
        const relleno0 = Math.random() < 0.5;
        const visibles = 5;
        const ang = i => mod(ang0 + dir * 90 * i, 360);
        const relleno = i => (i % 2 === 0 ? relleno0 : !relleno0);
        const mk = (a, f) => itemFlecha({ ang: a, relleno: f });
        const r = visibles;

        return {
            sequence: Array.from({ length: visibles }, (_, i) => mk(ang(i), relleno(i))),
            answer: mk(ang(r), relleno(r)),
            plausibles: [
                mk(ang(r), !relleno(r)),
                mk(ang(r - 1), relleno(r)),
                mk(ang(r - 1) - dir * 90, relleno(r)),
                mk(ang(r) + 180, !relleno(r))
            ],
            extra: () => mk(randInt(0, 3) * 90, pick([true, false])),
            hint: 'La flecha gira 90° en cada paso y además alterna entre llena y vacía.',
            explanation: `Cada flecha gira 90° en sentido ${dir === 1 ? 'horario' : 'antihorario'} y alterna su relleno. ` +
                `La siguiente apunta hacia ${NOMBRES_DIRECCION[ang(r)]} y está ${relleno(r) ? 'llena' : 'vacía'}.`
        };
    }

    // Nivel 13: giro constante de 90° + relleno en ciclo de 3 (llena, vacía, vacía…)
    function generateFlechasGiro90RellenoCiclo() {
        const dir = pick([1, -1]);
        const ang0 = randInt(0, 3) * 90;
        const base = [true, false, false];
        const fase = randInt(0, 2);
        const visibles = 6;
        const ang = i => mod(ang0 + dir * 90 * i, 360);
        const relleno = i => base[(i + fase) % 3];
        const mk = (a, f) => itemFlecha({ ang: a, relleno: f });
        const r = visibles;

        return {
            sequence: Array.from({ length: visibles }, (_, i) => mk(ang(i), relleno(i))),
            answer: mk(ang(r), relleno(r)),
            plausibles: [
                mk(ang(r), !relleno(r)),
                mk(ang(r - 1), relleno(r)),
                mk(ang(r - 1) - dir * 90, relleno(r)),
                mk(ang(r) + 180, relleno(r)),
                mk(ang(r - 1), !relleno(r))
            ],
            extra: () => mk(randInt(0, 3) * 90, pick([true, false])),
            hint: 'La flecha gira 90° cada vez y el relleno repite un ciclo de tres (llena, vacía, vacía).',
            explanation: `La flecha gira 90° en sentido ${dir === 1 ? 'horario' : 'antihorario'} en cada paso y el relleno sigue el patrón (llena, vacía, vacía). ` +
                `La siguiente apunta hacia ${NOMBRES_DIRECCION[ang(r)]} y está ${relleno(r) ? 'llena' : 'vacía'}.`
        };
    }

    // Nivel 14: giro en múltiplos de 90° alternando 1 cuarto de vuelta (90°) y 2 cuartos (180°)
    function generateFlechasGiro90DobleAlt() {
        const dir = pick([1, -1]);
        const ang0 = randInt(0, 3) * 90;
        const visibles = 6;
        const angs = [ang0];
        for (let i = 1; i <= visibles; i++) {
            const paso = i % 2 === 1 ? 90 : 180;
            angs.push(mod(angs[i - 1] + dir * paso, 360));
        }
        const mk = (a, f = true) => itemFlecha({ ang: a, relleno: f });
        const resp = angs[visibles];

        return {
            sequence: angs.slice(0, visibles).map(a => mk(a)),
            answer: mk(resp),
            plausibles: [
                mk(resp + 90),
                mk(resp + 180),
                mk(resp + 270)
            ],
            extra: () => mk(randInt(0, 3) * 90, true),
            hint: 'El giro alterna entre un cuarto de vuelta (90°) y media vuelta (180°).',
            explanation: `Los giros se alternan en sentido ${dir === 1 ? 'horario' : 'antihorario'}: primero 90°, luego 180° (dos pasos de 90°), luego 90°… ` +
                `La siguiente flecha apunta hacia ${NOMBRES_DIRECCION[resp]} (${resp}°).`
        };
    }

    // Nivel 15: giro constante de 90° + relleno por pares (llena, llena, vacía, vacía…)
    function generateFlechasGiro90Pares() {
        const dir = pick([1, -1]);
        const ang0 = randInt(0, 3) * 90;
        const base = [true, true, false, false];
        const offset = randInt(0, 3);
        const visibles = 6;
        const ang = i => mod(ang0 + dir * 90 * i, 360);
        const relleno = i => base[(i + offset) % 4];
        const mk = (a, f) => itemFlecha({ ang: a, relleno: f });
        const r = visibles;

        return {
            sequence: Array.from({ length: visibles }, (_, i) => mk(ang(i), relleno(i))),
            answer: mk(ang(r), relleno(r)),
            plausibles: [
                mk(ang(r), !relleno(r)),
                mk(ang(r) + 90, relleno(r)),
                mk(ang(r) + 180, relleno(r)),
                mk(ang(r) + 270, relleno(r)),
                mk(ang(r) + 90, !relleno(r))
            ],
            extra: () => mk(randInt(0, 3) * 90, pick([true, false])),
            hint: 'La flecha gira 90° por paso y el relleno cambia cada dos figuras (llena, llena, vacía, vacía).',
            explanation: `Cada flecha gira 90° en sentido ${dir === 1 ? 'horario' : 'antihorario'} y el relleno se agrupa de dos en dos (llena, llena, vacía, vacía). ` +
                `La siguiente apunta hacia ${NOMBRES_DIRECCION[ang(r)]} y está ${relleno(r) ? 'llena' : 'vacía'}.`
        };
    }

    // 15 generadores: 5 de números, 5 de letras y 5 de flechas (90°)
    const GENERADORES = [
        generateConstantDiff, generateIncreasingDiff, generateAddSubAlt, generateMultSubAlt, generateInterleaved,
        generateLetrasSaltoAscendente, generateLetrasSaltoConstante, generateLetrasSaltoCreciente, generateLetrasSaltosAlternados, generateLetrasIntercaladas,
        generateFlechasGiro90, generateFlechasGiro90RellenoAlt, generateFlechasGiro90RellenoCiclo, generateFlechasGiro90DobleAlt, generateFlechasGiro90Pares
    ];

    // Categoría (fase) a la que pertenece un nivel (1-15)
    function categoriaDeNivel(nivel) {
        return CATEGORIAS[Math.floor((nivel - 1) / NIVELES_POR_CATEGORIA)];
    }

    // Elige 3 distractores distintos entre sí y de la respuesta
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

    // Construye una pregunta completa para un nivel (1-15)
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

    // Genera los 15 niveles en orden (3 fases x 5 niveles)
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

    // ===== TEMPORIZADOR (cronómetro por nivel) =====
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

        // Explicación
        $('explanation-text').textContent = q.explanation;
        $('explanation').style.display = 'block';

        // Botón para continuar
        const esUltima = state.currentQuestion === state.questions.length - 1;
        const nextBtn = $('btn-next');
        nextBtn.innerHTML = esUltima
            ? `Ver Resultados <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
            : `Siguiente <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`;
        nextBtn.style.display = 'inline-flex';
    }

    // ===== PANTALLA DE INICIO DE FASE =====
    function showLevelIntro(nivel) {
        const cat = categoriaDeNivel(nivel);
        const idxCat = CATEGORIAS.indexOf(cat);
        $('level-badge').textContent = `Fase ${idxCat + 1} de ${CATEGORIAS.length}`;
        $('level-title').textContent = `Fase ${idxCat + 1} · ${cat.nombre}`;
        $('level-desc').textContent = `${cat.descripcion} Esta fase consta de ${NIVELES_POR_CATEGORIA} niveles.`;

        // Chips de avance por fase
        $('level-steps').innerHTML = CATEGORIAS.map((c, i) =>
            `<span class="level-steps__chip ${i < idxCat ? 'done' : i === idxCat ? 'current' : ''}">Fase ${i + 1}: ${c.nombre}</span>`
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
        const fase = CATEGORIAS.indexOf(cat) + 1;
        const nivelEnFase = ((q.nivel - 1) % NIVELES_POR_CATEGORIA) + 1;
        $('q-label').textContent = `Fase ${fase}/${CATEGORIAS.length} · Nivel ${nivelEnFase}/${NIVELES_POR_CATEGORIA} · ${cat.nombre}`;
        $('q-hint').textContent = `Pista: ${q.hint}`;
        $('progress-label').textContent = `Nivel ${index + 1} / ${state.questions.length}`;
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

    // Calcula el desglose por fase y por nivel a partir de state.results
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
            $('results-message').textContent = 'Acertaste los 15 niveles. ¡Eres un maestro de los patrones!';
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

        // Desglose por fase (con el acierto de cada nivel)
        const detalle = calcularDetalle();
        const detailContainer = $('results-detail');
        const titleEl = detailContainer.querySelector('.results-detail__title');
        detailContainer.innerHTML = '';
        detailContainer.appendChild(titleEl);

        detalle.categorias.forEach((c, i) => {
            const cat = CATEGORIAS[i];
            const porNivel = detalle.niveles
                .filter(n => n.categoria === c.categoria)
                .map((n, idx) => `N${idx + 1}: ${n.aciertos ? '✓' : '✗'}`)
                .join(' · ');
            const row = document.createElement('div');
            row.className = 'detail-row';
            row.innerHTML = `
        <div class="detail-row__left">
          <span class="detail-row__name">Fase ${i + 1} · ${cat.nombre}<small>${porNivel}</small></span>
        </div>
        <div style="text-align:right">
          <div class="detail-row__score">${c.aciertos}/${c.total}</div>
          <span class="detail-row__time">⌀ ${(c.tiempoMedioMs / 1000).toFixed(1)}s</span>
        </div>
      `;
            detailContainer.appendChild(row);
        });

        // Enviar el resultado al backend (una sola vez)
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

    // ===== ENVÍO DE RESULTADOS AL BACKEND (SQL Server) =====
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
        } else if (state.currentQuestion % NIVELES_POR_CATEGORIA === 0) {
            // Primer nivel de una nueva fase: mostrar portada de la fase
            showLevelIntro(state.questions[state.currentQuestion].nivel);
        } else {
            loadQuestion(state.currentQuestion);
        }
    });
};

