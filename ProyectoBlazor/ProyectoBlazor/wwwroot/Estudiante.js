/* Estudiante.js — antes estaba dentro de Estudiante.razor; se movió a wwwroot para que
   se ejecute siempre (Blazor no corre los <script> que están dentro de un .razor). */
window.iniciarEstudiante = function () {
    // ============================================================
    // "TUS RESULTADOS": pinta nivel, barra y 3 recomendaciones por
    // habilidad. Si hay un alumno con sesión (login.html guarda su id
    // en localStorage) usa sus resultados reales del servidor; si no,
    // muestra una vista de ejemplo con puntajes de muestra.
    // ============================================================
    const estudianteId = localStorage.getItem('estudianteId');
    const estudianteNombre = localStorage.getItem('estudianteNombre');
    const PRUEBAS = ['memoria', 'atencion', 'razonamiento', 'velocidad'];

    // Nivel según el puntaje: >=75 Fuerte (verde), >=50 Promedio (amarillo), menos Por reforzar (rojo)
    function nivelDeDesempeno(puntaje) {
        if (puntaje >= 75) return { id: 'fuerte', texto: 'Fuerte', clase: 'level-strong', color: '#1E9E63' };
        if (puntaje >= 50) return { id: 'promedio', texto: 'Promedio', clase: 'level-avg', color: '#F2C230' };
        return { id: 'reforzar', texto: 'Por reforzar', clase: 'level-focus', color: '#D14343' };
    }

    // 3 recomendaciones por habilidad y por nivel (4 habilidades x 3 niveles x 3 = 36)
    const RECOMENDACIONES = {
        memoria: {
            fuerte: [
                'Sigue usando repasos espaciados: repite lo aprendido a intervalos crecientes (1 día, 3 días, 1 semana).',
                'Explica el tema a un compañero: enseñar en voz alta consolida lo que ya retienes.',
                'Reta tu memoria con material más complejo: resume varios temas sin mirar tus apuntes.'
            ],
            promedio: [
                'Agrupa la información en bloques pequeños (de 3 a 5 ideas) antes de memorizarla.',
                'Asocia los datos nuevos con imágenes, historias o ejemplos de tu vida diaria.',
                'Repasa lo estudiado antes de dormir y vuelve a repasarlo al día siguiente.'
            ],
            reforzar: [
                'Estudia en sesiones cortas de 15 a 20 minutos con pausas; evita memorizar todo de una sola vez.',
                'Convierte los temas en mapas mentales, esquemas o tarjetas de estudio.',
                'Practica la recuperación: cierra el libro y escribe todo lo que recuerdes antes de volver a revisar.'
            ]
        },
        atencion: {
            fuerte: [
                'Aprovecha tu concentración para las tareas más difíciles, en tu horario de mayor energía.',
                'Mantén tus hábitos: un espacio de estudio ordenado y sin notificaciones.',
                'Practica alternar entre dos tareas de forma planeada para conservar tu flexibilidad mental.'
            ],
            promedio: [
                'Estudia en bloques de 25 minutos con pausas de 5 (técnica Pomodoro).',
                'Silencia el celular y deja a la vista solo el material de la tarea actual.',
                'Antes de empezar, anota qué quieres lograr en esa sesión para mantener el objetivo.'
            ],
            reforzar: [
                'Empieza con bloques de 10 a 15 minutos y auméntalos poco a poco.',
                'Elige un lugar fijo, sin ruido ni pantallas distractoras, solo para estudiar.',
                'Haz una pausa activa (caminar, estirarte, respirar profundo) entre bloques para recuperar la atención.'
            ]
        },
        razonamiento: {
            fuerte: [
                'Resuelve casos de estudio y problemas abiertos que exijan combinar varios conceptos.',
                'Plantea tus propias preguntas del tipo "¿qué pasaría si...?" sobre cada tema.',
                'Explica tu razonamiento paso a paso: te ayuda a detectar atajos y errores.'
            ],
            promedio: [
                'Antes de resolver, identifica la regla: ¿qué cambia y qué se mantiene?',
                'Practica con ejercicios graduales: empieza por los fáciles y sube la dificultad.',
                'Después de cada error, revisa en qué paso te desviaste en lugar de solo ver la respuesta.'
            ],
            reforzar: [
                'Divide los problemas en partes pequeñas y resuelve una a la vez.',
                'Apóyate en dibujos, tablas o ejemplos concretos para ver el patrón.',
                'Practica con sucesiones y acertijos lógicos 10 minutos al día para entrenar la detección de patrones.'
            ]
        },
        velocidad: {
            fuerte: [
                'Aprovecha tu rapidez, pero revisa tus respuestas para no cometer errores por prisa.',
                'Practica con ejercicios cronometrados más difíciles para mantener tu ritmo.',
                'Haz primero lo rápido y deja tiempo suficiente para lo complejo.'
            ],
            promedio: [
                'Practica ejercicios con límite de tiempo, subiendo la exigencia poco a poco.',
                'Antes de un examen, planea cuánto tiempo darás a cada pregunta.',
                'Si te atoras, pasa a la siguiente y regresa después.'
            ],
            reforzar: [
                'Empieza practicando sin presión de tiempo y después añade un cronómetro amplio.',
                'Familiarízate con el formato de las tareas: la práctica repetida reduce el tiempo de respuesta.',
                'Cuida lo básico: dormir bien, desayunar y reducir el estrés mejoran la rapidez de respuesta.'
            ]
        }
    };

    function pintarTarjeta(prueba, resultado) {
        const card = document.getElementById('result-' + prueba);
        if (!card) return;
        const levelEl = card.querySelector('.level');
        const barFill = card.querySelector('.bar-fill');
        const lista = card.querySelector('.rec-list');

        if (!resultado) {
            // Todavía no ha completado esta prueba
            levelEl.textContent = 'Pendiente';
            levelEl.className = 'level';
            levelEl.style.background = '#ECEDEF';
            levelEl.style.color = '#6B7280';
            barFill.style.width = '0%';
            lista.innerHTML = '<li>Completa esta prueba para recibir tus 3 recomendaciones.</li>';
            return;
        }

        const puntaje = Math.max(0, Math.min(100, Math.round(resultado.puntaje)));
        const nivel = nivelDeDesempeno(puntaje);
        levelEl.textContent = nivel.texto + ' · ' + puntaje + '%';
        levelEl.className = 'level ' + nivel.clase;
        levelEl.style.background = '';
        levelEl.style.color = '';
        barFill.style.width = puntaje + '%';
        barFill.style.background = nivel.color;
        lista.innerHTML = RECOMENDACIONES[prueba][nivel.id].map((t) => '<li>' + t + '</li>').join('');
    }

    // ============================================================
    // ESTILO DE APRENDIZAJE (visual / auditivo / kinestésico)
    // 6 preguntas; cada opción suma a un estilo. Gana el que más suma
    // (en empate, el primero en el orden visual, auditivo, kinestésico).
    // ============================================================
    const PREGUNTAS_ESTILO = [
        { q: 'Cuando quieres aprender algo nuevo, prefieres...', o: ['Ver un video, una imagen o un diagrama', 'Que alguien te lo explique', 'Probarlo tú mismo'] },
        { q: 'Para recordar un número de teléfono...', o: ['Me lo imagino escrito', 'Lo repito en voz alta', 'Lo marco o lo escribo con los dedos'] },
        { q: 'En clase aprendes mejor cuando...', o: ['El profesor usa pizarrón, imágenes o esquemas', 'Explica y se platica o discute el tema', 'Hay prácticas y actividades para hacer'] },
        { q: 'Al estudiar para un examen...', o: ['Subrayo y hago esquemas de colores', 'Me explico el tema en voz alta o con un compañero', 'Camino o hago ejercicios mientras repaso'] },
        { q: 'Cuando armas o instalas algo nuevo...', o: ['Miro las imágenes del instructivo', 'Leo o escucho las instrucciones', 'Empiezo a armarlo y voy descubriendo'] },
        { q: 'Te distraes más cuando...', o: ['Hay desorden o mucho movimiento a tu alrededor', 'Hay ruido o conversaciones', 'Tienes que estar sentado sin moverte'] }
    ];
    const ESTILOS = {
        visual: {
            nombre: 'Visual',
            rec: 'Apóyate en mapas mentales, esquemas, colores y subrayado; convierte los textos en diagramas y usa videos o imágenes para estudiar.'
        },
        auditivo: {
            nombre: 'Auditivo',
            rec: 'Explica los temas en voz alta, graba tus propios resúmenes para escucharlos, estudia en grupo y apóyate en podcasts o clases grabadas.'
        },
        kinestesico: {
            nombre: 'Kinestésico',
            rec: 'Estudia en movimiento: haz ejercicios prácticos, maquetas o simulaciones, escribe a mano y toma pausas activas entre bloques.'
        }
    };
    const ORDEN_ESTILOS = ['visual', 'auditivo', 'kinestesico'];
    const CLAVE_ESTILO = 'estiloAprendizaje:' + (estudianteId || 'ejemplo');
    const styleCard = document.getElementById('style-card');

    function estiloGuardado() {
        try { return localStorage.getItem(CLAVE_ESTILO); } catch (e) { return null; }
    }

    function pintarEstilo() {
        const estilo = estiloGuardado();
        if (estilo && ESTILOS[estilo]) {
            styleCard.innerHTML =
                '<span class="style-result">Estilo de aprendizaje: ' + ESTILOS[estilo].nombre + '</span>' +
                '<h3>Recomendación según tu estilo</h3>' +
                '<p>' + ESTILOS[estilo].rec + '</p>' +
                '<button type="button" class="style-btn secondary" id="btn-repetir-estilo" style="margin-left:0;">Repetir cuestionario</button>';
            document.getElementById('btn-repetir-estilo').addEventListener('click', pintarCuestionario);
        } else {
            styleCard.innerHTML =
                '<h3>Tu estilo de aprendizaje</h3>' +
                '<p>Responde 6 preguntas rápidas para saber si aprendes mejor de forma visual, auditiva o kinestésica y recibir una recomendación extra.</p>' +
                '<button type="button" class="style-btn" id="btn-iniciar-estilo">Responder cuestionario</button>';
            document.getElementById('btn-iniciar-estilo').addEventListener('click', pintarCuestionario);
        }
    }

    function pintarCuestionario() {
        const preguntas = PREGUNTAS_ESTILO.map((p, i) =>
            '<div class="quiz-q"><div>' + (i + 1) + '. ' + p.q + '</div>' +
            p.o.map((txt, j) =>
                '<label><input type="radio" name="estilo' + i + '" value="' + ORDEN_ESTILOS[j] + '">' + txt + '</label>'
            ).join('') + '</div>'
        ).join('');
        styleCard.innerHTML =
            '<h3>Tu estilo de aprendizaje</h3><p>Elige la opción que más se parezca a ti en cada pregunta.</p>' +
            '<form id="form-estilo">' + preguntas +
            '<div class="quiz-error" id="quiz-error" hidden>Responde las 6 preguntas para ver tu resultado.</div>' +
            '<button type="submit" class="style-btn">Ver mi estilo</button>' +
            '<button type="button" class="style-btn secondary" id="btn-cancelar-estilo">Cancelar</button></form>';
        document.getElementById('btn-cancelar-estilo').addEventListener('click', pintarEstilo);
        document.getElementById('form-estilo').addEventListener('submit', (e) => {
            e.preventDefault();
            const cuenta = { visual: 0, auditivo: 0, kinestesico: 0 };
            let respondidas = 0;
            PREGUNTAS_ESTILO.forEach((_, i) => {
                const marcada = document.querySelector('input[name="estilo' + i + '"]:checked');
                if (marcada) { cuenta[marcada.value]++; respondidas++; }
            });
            if (respondidas < PREGUNTAS_ESTILO.length) {
                document.getElementById('quiz-error').hidden = false;
                return;
            }
            const ganador = ORDEN_ESTILOS.reduce((a, b) => (cuenta[b] > cuenta[a] ? b : a));
            try { localStorage.setItem(CLAVE_ESTILO, ganador); } catch (err) { /* sin almacenamiento: solo se muestra */ }
            pintarEstilo();
        });
    }

    // ============================================================
    // Arranque: ejemplo si no hay sesión; resultados reales si la hay
    // ============================================================

    // ============================================================
    // Pruebas completadas: ya no se puede volver a entrar
    // ============================================================
    function bloquearCompletada(prueba) {
        const card = document.querySelector('a.test-card[data-prueba="' + prueba + '"]');
        if (!card || card.classList.contains('completada')) return;
        card.classList.add('completada');
        card.removeAttribute('href');
        card.setAttribute('aria-disabled', 'true');
        const st = card.querySelector('.test-status');
        st.textContent = 'Completado';
        st.className = 'test-status done';
    }

    // Unirse a un grupo en SQL Server
    const inputCodigo = document.getElementById('code');
    const btnUnirseGrupo = document.getElementById('btnUnirseGrupo');
    const grupoActual = localStorage.getItem('grupoCodigo');
    if (inputCodigo && grupoActual) {
        inputCodigo.value = grupoActual;
    }
    if (btnUnirseGrupo && inputCodigo) {
        btnUnirseGrupo.addEventListener('click', async () => {
            const codigo = inputCodigo.value.trim().toUpperCase();
            if (!codigo) return;
            if (!estudianteId) {
                alert('Inicia sesión como estudiante para unirte a un grupo.');
                return;
            }
            btnUnirseGrupo.disabled = true;
            try {
                const res = await fetch('/api/grupos/unirse', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estudianteId: Number(estudianteId), codigo })
                });
                const data = await res.json();
                if (!res.ok) {
                    alert(data.error || 'No se encontró ese código de grupo.');
                    return;
                }
                localStorage.setItem('grupoCodigo', data.codigo);
                inputCodigo.value = data.codigo;
                alert('Te has inscrito correctamente al grupo ' + data.codigo + '.');
            } catch (err) {
                alert('Error al conectar con la base de datos.');
            } finally {
                btnUnirseGrupo.disabled = false;
            }
        });
    }

    pintarEstilo();

    if (!estudianteId) {
        // Vista de ejemplo con puntajes de muestra (uno de cada nivel)
        const ejemplo = { memoria: 86, atencion: 58, razonamiento: 78, velocidad: 34 };
        PRUEBAS.forEach((p) => pintarTarjeta(p, { puntaje: ejemplo[p] }));
    } else {
        PRUEBAS.forEach((p) => pintarTarjeta(p, null));
        // Cargar resultados reales del estudiante desde SQL Server
        fetch('/api/estudiantes/' + encodeURIComponent(estudianteId) + '/resumen')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data || !data.resumen) return;
                if (data.grupoCodigo && inputCodigo && !inputCodigo.value) {
                    inputCodigo.value = data.grupoCodigo;
                    localStorage.setItem('grupoCodigo', data.grupoCodigo);
                }
                const tag = document.getElementById('results-tag');
                tag.textContent = 'Tus resultados';
                tag.style.color = '#1E9E63';
                tag.style.background = '#E3F5EC';
                document.getElementById('results-sub').textContent = estudianteNombre
                    ? 'Este es tu perfil cognitivo, ' + estudianteNombre + ', según tus pruebas completadas.'
                    : 'Este es tu perfil cognitivo según tus pruebas completadas.';
                PRUEBAS.forEach((p) => pintarTarjeta(p, data.resumen[p]));
                PRUEBAS.forEach((p) => { if (data.resumen[p]) bloquearCompletada(p); });
            })
            .catch(() => { });
    }
};