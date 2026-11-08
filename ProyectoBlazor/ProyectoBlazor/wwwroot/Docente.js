/* Docente.js — antes estaba dentro de Docente.razor; se movió a wwwroot para que
   se ejecute siempre (Blazor no corre los <script> que están dentro de un .razor). */
window.iniciarDocente = function () {
    const btn = document.getElementById('genCodeBtn');
    const codeEl = document.getElementById('groupCode');
    const inputCodigoExistente = document.getElementById('inputCodigoExistente');
    const btnCargarCodigo = document.getElementById('btnCargarCodigo');
    const btnActualizar = document.getElementById('btnActualizar');

    // Pequeño efecto visual: el código "destella" en color ámbar y luego
    // regresa suavemente al azul marino normal, para que se note el cambio.
    function destellarCodigo() {
        codeEl.style.transition = 'none';
        codeEl.style.color = '#C97B2E';
        requestAnimationFrame(() => {
            codeEl.style.transition = 'color .6s ease';
            codeEl.style.color = '#1A3560';
        });
    }

    // ── Generar un código de grupo NUEVO en SQL Server ──
    async function generarCodigoNuevo() {
        btn.disabled = true;
        try {
            const docenteId = Number(localStorage.getItem('docenteId') || 0);
            const res = await fetch('/api/grupos/generar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ docenteId: docenteId > 0 ? docenteId : null })
            });
            if (!res.ok) throw new Error('Error al generar grupo');
            const data = await res.json();

            localStorage.setItem('grupoDocenteCodigo', data.grupo.codigo);
            codeEl.textContent = data.grupo.codigo;
            destellarCodigo();
            cargarDatosGrupo(data.grupo.codigo);
        } catch (err) {
            alert('No se pudo generar el código en la base de datos.');
        } finally {
            btn.disabled = false;
        }
    }

    btn.addEventListener('click', generarCodigoNuevo);

    btnCargarCodigo.addEventListener('click', () => {
        const codigo = inputCodigoExistente.value.trim().toUpperCase();
        if (!codigo) return;
        localStorage.setItem('grupoDocenteCodigo', codigo);
        codeEl.textContent = codigo;
        destellarCodigo();
        cargarDatosGrupo(codigo);
    });

    btnActualizar.addEventListener('click', () => {
        const codigo = localStorage.getItem('grupoDocenteCodigo');
        if (codigo) cargarDatosGrupo(codigo);
    });

    // ── Cargar y pintar los resultados reales de un grupo desde SQL Server ──
    const PRUEBAS = ['memoria', 'atencion', 'razonamiento', 'velocidad'];
    const NOMBRES_PRUEBA = { memoria: 'Memoria', atencion: 'Atención', razonamiento: 'Razonamiento', velocidad: 'Velocidad' };
    const COLOR_PRUEBA = { memoria: '#1E9E63', atencion: '#C97B2E', razonamiento: '#1A3560', velocidad: '#D14343' };

    async function cargarDatosGrupo(codigo) {
        try {
            const res = await fetch('/api/grupos/' + encodeURIComponent(codigo));
            if (!res.ok) throw new Error('Grupo no encontrado');
            const data = await res.json();
            pintarDashboard(data.estudiantes || []);
        } catch (err) {
            document.getElementById('notaFinal').textContent =
                'No se encontró ese código de grupo en la base de datos.';
        }
    }

    // Cuenta cuántos alumnos del grupo hay en cada nivel de cada habilidad
    // y lo muestra en la tabla guía (según su resultado más reciente).
    function pintarGuia(estudiantes) {
        PRUEBAS.forEach((prueba) => {
            const conteo = { fuerte: 0, promedio: 0, reforzar: 0 };
            estudiantes.forEach(({ resumen }) => {
                if (!resumen[prueba]) return;
                const pts = Math.round(resumen[prueba].puntaje);
                if (pts >= 75) conteo.fuerte++;
                else if (pts >= 50) conteo.promedio++;
                else conteo.reforzar++;
            });
            Object.keys(conteo).forEach((nivel) => {
                const el = document.getElementById('guia-' + prueba + '-' + nivel);
                if (!el) return;
                el.textContent = conteo[nivel] + (conteo[nivel] === 1 ? ' alumno' : ' alumnos');
                el.classList.toggle('has', conteo[nivel] > 0);
            });
        });
    }

    function pintarDashboard(estudiantes) {
        pintarGuia(estudiantes);
        document.getElementById('statAlumnos').textContent = estudiantes.length;

        let evaluacionesCompletas = 0;
        const sumas = { memoria: 0, atencion: 0, razonamiento: 0, velocidad: 0 };
        const conteos = { memoria: 0, atencion: 0, razonamiento: 0, velocidad: 0 };

        estudiantes.forEach(({ resumen }) => {
            PRUEBAS.forEach((prueba) => {
                if (resumen[prueba]) {
                    evaluacionesCompletas++;
                    sumas[prueba] += resumen[prueba].puntaje;
                    conteos[prueba]++;
                }
            });
        });

        document.getElementById('statEvaluaciones').textContent = evaluacionesCompletas;

        // Promedios por prueba (null si nadie la ha completado todavía)
        const promedios = {};
        PRUEBAS.forEach((prueba) => {
            promedios[prueba] = conteos[prueba] > 0 ? Math.round(sumas[prueba] / conteos[prueba]) : null;
        });

        const pruebasConDatos = PRUEBAS.filter((p) => promedios[p] !== null);
        if (pruebasConDatos.length > 0) {
            const masFuerte = pruebasConDatos.reduce((a, b) => (promedios[a] >= promedios[b] ? a : b));
            const aReforzar = pruebasConDatos.reduce((a, b) => (promedios[a] <= promedios[b] ? a : b));
            document.getElementById('statFuerte').textContent = NOMBRES_PRUEBA[masFuerte];
            document.getElementById('statReforzar').textContent = NOMBRES_PRUEBA[aReforzar];
        } else {
            document.getElementById('statFuerte').textContent = '—';
            document.getElementById('statReforzar').textContent = '—';
        }

        // Gráfica de barras
        document.getElementById('chartTag').textContent = estudiantes.length > 0 ? 'Datos reales del grupo' : 'Vista de ejemplo';
        PRUEBAS.forEach((prueba) => {
            const promedio = promedios[prueba];
            const sufijo = prueba.charAt(0).toUpperCase() + prueba.slice(1);
            const valorEl = document.getElementById('chartVal' + sufijo);
            const fillEl = document.getElementById('chartFill' + sufijo);
            valorEl.textContent = promedio !== null ? promedio + '%' : '—';
            fillEl.style.height = (promedio !== null ? promedio : 0) + '%';
            fillEl.style.background = COLOR_PRUEBA[prueba];
        });

        // Tabla de alumnos
        const tbody = document.getElementById('tablaAlumnos');
        if (estudiantes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--muted);">Todavía no se ha unido ningún estudiante con este código.</td></tr>';
        } else {
            tbody.innerHTML = estudiantes.map(({ estudiante, resumen }) => {
                const completas = PRUEBAS.filter((p) => resumen[p]).length;
                let tagClase = 'tag-pending', tagTexto = 'Pendiente';
                if (completas === PRUEBAS.length) { tagClase = 'tag-complete'; tagTexto = 'Completo'; }
                else if (completas > 0) { tagClase = 'tag-progress'; tagTexto = 'En progreso'; }

                // Una gráfica circular por prueba, con el mismo criterio de color
                // que ve el alumno: >=75 Fuerte, >=50 Promedio, menos Por reforzar.
                const celdas = PRUEBAS.map((p) => {
                    if (!resumen[p]) return '<td class="res-cell"><div class="donut level-none"><b>—</b></div><span class="donut-lbl">Pendiente</span></td>';
                    const pts = Math.max(0, Math.min(100, Math.round(resumen[p].puntaje)));
                    let clase = 'level-focus', texto = 'Por reforzar';
                    if (pts >= 75) { clase = 'level-strong'; texto = 'Fuerte'; }
                    else if (pts >= 50) { clase = 'level-avg'; texto = 'Promedio'; }
                    return `<td class="res-cell"><div class="donut ${clase}" style="--pct:${pts}"><b>${pts}%</b></div><span class="donut-lbl">${texto}</span></td>`;
                }).join('');

                return `<tr>
          <td>${estudiante.nombre}</td>
          ${celdas}
          <td>${completas} / ${PRUEBAS.length}</td>
          <td><span class="tag ${tagClase}">${tagTexto}</span></td>
        </tr>`;
            }).join('');
        }

        document.getElementById('notaFinal').textContent = estudiantes.length > 0
            ? 'Los resultados se actualizan según tus alumnos van completando las 4 pruebas. Usa "Actualizar resultados" para ver lo más reciente.'
            : 'El grupo aún no tiene alumnos — comparte el código de arriba para que empiecen a aparecer aquí.';
    }

    // ── Al cargar la página: si ya había un grupo guardado en este
    //    navegador, lo mostramos y cargamos sus datos automáticamente ──
    (function init() {
        const codigoGuardado = localStorage.getItem('grupoDocenteCodigo');
        if (codigoGuardado) {
            codeEl.textContent = codigoGuardado;
            cargarDatosGrupo(codigoGuardado);
        }
    })();
};