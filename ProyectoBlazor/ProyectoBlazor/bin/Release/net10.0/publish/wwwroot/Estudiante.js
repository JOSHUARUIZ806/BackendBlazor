/* Estudiante.js — antes estaba dentro de Estudiante.razor; se movió a wwwroot para que
   se ejecute siempre (Blazor no corre los <script> que están dentro de un .razor). */
window.iniciarEstudiante = function () {
    // ============================================================
    // "TUS RESULTADOS": pinta nivel, barra y recomendaciones por
    // habilidad según el desempeño (Por mejorar, Intermedio, Bueno)
    // y el tipo de aprendizaje del alumno.
    // ============================================================
    const estudianteId = localStorage.getItem('estudianteId');
    const estudianteNombre = localStorage.getItem('estudianteNombre');
    const PRUEBAS = ['memoria', 'atencion', 'razonamiento', 'velocidad'];
    let datosResumen = null;

    // Nivel según el puntaje: >=75 Bueno (verde), >=50 Intermedio (amarillo), <50 Por mejorar (rojo)
    function nivelDeDesempeno(puntaje) {
        if (puntaje >= 75) return { id: 'bueno', texto: 'Bueno', clase: 'level-strong', color: '#1E9E63' };
        if (puntaje >= 50) return { id: 'intermedio', texto: 'Intermedio', clase: 'level-avg', color: '#F2C230' };
        return { id: 'por_mejorar', texto: 'Por mejorar', clase: 'level-focus', color: '#D14343' };
    }

    function formatearRecomendacion(texto) {
        const prefijos = ['En clase:', 'En tareas:', 'En exámenes:'];
        for (const p of prefijos) {
            if (texto.startsWith(p)) {
                return '<strong>' + p + '</strong> ' + texto.slice(p.length).trim();
            }
        }
        return texto;
    }

    // ============================================================
    // RECOMENDACIONES divididas por prueba, tipo de aprendizaje y nivel
    // (4 pruebas x 4 estilos x 3 niveles = 48 combinaciones con 3 pautas c/u)
    // ============================================================
    const RECOMENDACIONES = {
        memoria: {
            visual: {
                por_mejorar: [
                    'En clase: Usa un código de tres colores en tus apuntes (uno para definiciones, otro para ejemplos y otro para fechas o fórmulas) para ubicar cada dato con un solo vistazo.',
                    'En tareas: Transforma los textos largos en tarjetas con un dibujo o ícono simple en el frente y el concepto breve al reverso, y repásalas en intervalos de 1, 3 y 7 días.',
                    'En exámenes: Antes de empezar a contestar, haz un pequeño bosquejo o diagrama rápido en una hoja borrador con las fórmulas o esquemas clave que acabas de repasar.'
                ],
                intermedio: [
                    'En clase: Deja un margen libre en tu cuaderno para dibujar diagramas de flujo o flechas que conecten lo que explica el profesor con temas de sesiones anteriores.',
                    'En tareas: Al terminar de estudiar un capítulo, dibuja un mapa mental de memoria sin ver tus apuntes y luego complétalo con otro color para detectar qué olvidaste.',
                    'En exámenes: Asocia cada bloque del temario con una página o esquema visual específico para reconstruir mentalmente la ubicación de la información cuando te bloquees.'
                ],
                bueno: [
                    'En clase: Sintetiza clases completas en una sola página tipo infografía o cuadro sinóptico mientras escuchas, priorizando la jerarquía visual de las ideas.',
                    'En tareas: Construye un tablero visual o línea de tiempo integradora por unidad que conecte conceptos de distintas materias del semestre.',
                    'En exámenes: Utiliza el método del palacio de la memoria (asociar datos complejos a lugares físicos conocidos) para recordar listas extensas o secuencias técnicas sin esfuerzo.'
                ]
            },
            auditivo: {
                por_mejorar: [
                    'En clase: Pide permiso para grabar fragmentos clave de la explicación y escucha únicamente los primeros 10 minutos más importantes al llegar a casa.',
                    'En tareas: Lee en voz alta tus resúmenes y graba notas de voz cortas (de 1 a 2 minutos por tema) para escucharlas mientras te trasladas.',
                    'En exámenes: Repite en silencio las palabras clave de la pregunta para activar el recuerdo de cómo sonó la explicación en clase.'
                ],
                intermedio: [
                    'En clase: Reformula en voz baja o en tu mente, con tus propias palabras, cada idea principal que el docente concluya antes de pasar al siguiente punto.',
                    'En tareas: Explica el tema en voz alta frente a un compañero o grabándote sin leer notas, usando rimas o acrónimos pronunciables para datos difíciles.',
                    'En exámenes: Recrea mentalmente las discusiones de clase o las preguntas que hicieron tus compañeros sobre ese tema para recuperar detalles específicos.'
                ],
                bueno: [
                    'En clase: Participa haciendo preguntas de síntesis al profesor ("entonces, ¿esto se conecta con X?") para fijar la respuesta mediante el diálogo directo.',
                    'En tareas: Organiza mini sesiones de estudio estilo podcast o debate donde cada integrante explica un subtema de memoria y responde preguntas rápidas.',
                    'En exámenes: Estructura tus respuestas abiertas siguiendo el hilo narrativo con el que explicarías el tema oralmente, asegurando coherencia y precisión terminológica.'
                ]
            },
            kinestesico: {
                por_mejorar: [
                    'En clase: Toma apuntes a mano en lugar de usar teclado; el movimiento físico de escribir mejora la codificación inicial de la información.',
                    'En tareas: Usa fichas físicas y ordénalas sobre una mesa agrupándolas por categorías o secuencias, moviéndolas físicamente mientras las repasas.',
                    'En exámenes: Asocia cada unidad de estudio con un gesto discreto o una postura específica durante el repaso para usarlo como detonador de memoria en la prueba.'
                ],
                intermedio: [
                    'En clase: Anota ejemplos prácticos o situaciones de la vida real junto a cada concepto teórico para anclar el recuerdo a una acción concreta.',
                    'En tareas: Camina por tu habitación mientras recitas definiciones o procesos clave, asignando una esquina o espacio diferente a cada subtema.',
                    'En exámenes: Reconstruye procedimientos difíciles simulando con la mano o en borrador el paso a paso práctico que realizaste en ejercicios o laboratorios.'
                ],
                bueno: [
                    'En clase: Traduce teorías abstractas en mini casos aplicados o experimentos mentales que luego puedas replicar en ejercicios prácticos.',
                    'En tareas: Diseña maquetas, prototipos, simulaciones o juegos de tarjetas cronometrados para consolidar temas densos mediante la práctica activa.',
                    'En exámenes: Aplica la estrategia de "volcado práctico": resuelve mentalmente un ejemplo concreto del concepto para verificar que recuerdas la regla general con exactitud.'
                ]
            },
            lector: {
                por_mejorar: [
                    'En clase: Escribe frases cortas con palabras clave en lugar de intentar transcribir todo lo que dice el docente, y al final anota 3 ideas resumen.',
                    'En tareas: Reescribe con tus propias palabras las definiciones más difíciles en un glosario personal y repásalo escribiendo el concepto sin mirar.',
                    'En exámenes: Escribe en el margen del examen palabras detonadoras relacionadas con cada tema antes de redactar respuestas largas para no olvidar puntos clave.'
                ],
                intermedio: [
                    'En clase: Aplica el método Cornell dividiendo la hoja en notas, preguntas clave y resumen final para obligar a tu memoria a recuperar lo visto ese mismo día.',
                    'En tareas: Redacta tus propios cuestionarios de respuesta corta después de leer un capítulo y contéstalos por escrito al día siguiente sin consultar el texto.',
                    'En exámenes: Haz un punteo rápido (3 a 5 viñetas) antes de contestar preguntas de desarrollo para asegurar que incluyes toda la terminología requerida.'
                ],
                bueno: [
                    'En clase: Elabora fichas textuales comparativas que integren tus apuntes con las lecturas previas asignadas en el plan de estudios.',
                    'En tareas: Redacta guías de estudio breves como si fueran manuales para alumnos de nuevo ingreso, sintetizando capítulos enteros en una cuartilla.',
                    'En exámenes: Emplea la recuperación escrita en borrador para listar conceptos relacionados, verificar definiciones exactas y pulir el rigor de tus respuestas finales.'
                ]
            }
        },
        razonamiento: {
            visual: {
                por_mejorar: [
                    'En clase: Dibuja flechas de causa y efecto (A provoca B) en tus apuntes para distinguir claramente cuál es el origen de un fenómeno y cuál es su consecuencia.',
                    'En tareas: Antes de resolver un problema complejo, dibuja la situación o usa una tabla de dos columnas ("Datos que tengo" vs. "Lo que busco").',
                    'En exámenes: Subraya o encierra en distintos colores las condiciones y restricciones de cada enunciado para no pasar por alto ningún dato lógico.'
                ],
                intermedio: [
                    'En clase: Construye árboles de decisión o diagramas de flujo cuando el profesor explique procedimientos con múltiples pasos o condiciones.',
                    'En tareas: Compara dos métodos distintos para resolver un mismo problema usando cuadros comparativos visuales que muestren ventajas y errores comunes.',
                    'En exámenes: Esquematiza rápidamente los problemas de lógica, matemáticas o casos de estudio antes de hacer cálculos o elegir una opción.'
                ],
                bueno: [
                    'En clase: Mapea las relaciones ocultas entre argumentos o teorías opuestas usando diagramas de Venn o matrices de contraste.',
                    'En tareas: Diseña modelos visuales propios (gráficas, esquemas sistémicos) para predecir qué pasaría si cambiara una variable clave del problema.',
                    'En exámenes: Verifica la coherencia de tus respuestas revisando visualmente si el resultado tiene sentido respecto a la escala, gráfica o estructura del problema original.'
                ]
            },
            auditivo: {
                por_mejorar: [
                    'En clase: Escucha atentamente los conectores lógicos que usa el docente ("por lo tanto", "sin embargo", "si ocurre esto") y anótalos como señales de razonamiento.',
                    'En tareas: Habla en voz alta explicando el "por qué" de cada paso mientras resuelves ejercicios; si no puedes explicarlo con claridad, ahí está la falla lógica.',
                    'En exámenes: Lee mentalmente el problema haciendo pausas en cada condición, como si alguien te lo estuviera dictando lentamente, para detectar trampas en la redacción.'
                ],
                intermedio: [
                    'En clase: Formula preguntas sobre casos hipotéticos ("¿qué pasaría si quitáramos esta condición?") para poner a prueba los límites de la regla explicada.',
                    'En tareas: Resuelve problemas en pareja turnándose: uno razona en voz alta y el otro actúa como auditor señalando saltos lógicos o supuestos sin comprobar.',
                    'En exámenes: Cuando dudes entre dos respuestas de opción múltiple, argumenta mentalmente en contra de cada una para descartar la que tenga contradicciones.'
                ],
                bueno: [
                    'En clase: Identifica en tiempo real las premisas y conclusiones de las exposiciones del docente y detecta qué evidencia respalda cada afirmación.',
                    'En tareas: Organiza debates breves de estudio defendiendo la postura contraria a la tuya para fortalecer tu pensamiento crítico y detectar falacias.',
                    'En exámenes: Revisa tus justificaciones leyéndolas mentalmente con tono crítico, buscando huecos argumentativos como si fueras el evaluador.'
                ]
            },
            kinestesico: {
                por_mejorar: [
                    'En clase: Relaciona cada concepto abstracto con un objeto o acción cotidiana que puedas imaginar manipulando paso a paso.',
                    'En tareas: Divide los problemas largos en tarjetas físicas (una por paso) y ordénalas manualmente hasta comprobar que la secuencia lógica funciona.',
                    'En exámenes: Usa tus dedos, marcas físicas o pequeños esquemas manipulables en borrador para seguir secuencias lógicas o conteos sin perder el hilo.'
                ],
                intermedio: [
                    'En clase: Replica por tu cuenta los ejercicios que el profesor hace en el pizarrón en lugar de solo copiarlos, adelantándote un paso para probar tu lógica.',
                    'En tareas: Experimenta cambiando los valores iniciales de un ejercicio ya resuelto para observar directamente cómo se comporta la solución.',
                    'En exámenes: Prueba tus respuestas sustituyendo el resultado obtenido en el planteamiento original (prueba inversa) para comprobar de forma práctica que funciona.',
                ],
                bueno: [
                    'En clase: Propón simulaciones, casos de laboratorio o aplicaciones reales de los modelos teóricos para validar cómo operan fuera del papel.',
                    'En tareas: Resuelve problemas abiertos o de nivel superior aplicando ensayo y error controlado, registrando qué hipótesis fallaron y por qué.',
                    'En exámenes: Evalúa casos límite (valores extremos o escenarios atípicos) en tus ejercicios de razonamiento para confirmar la solidez de tu solución.'
                ]
            },
            lector: {
                por_mejorar: [
                    'En clase: Anota siempre el "por qué" junto a cada fórmula o regla, usando una frase breve que explique cuándo se aplica y cuándo no.',
                    'En tareas: Reescribe el enunciado de cada problema con tus propias palabras y haz una lista numerada de pasos antes de empezar a resolverlo.',
                    'En exámenes: Lee la pregunta completa dos veces y anota al margen exactamente qué te están pidiendo demostrar, calcular o comparar.'
                ],
                intermedio: [
                    'En clase: Redacta preguntas analíticas en tus apuntes (del tipo "¿en qué se diferencia A de B?") para responderlas por escrito durante tu repaso.',
                    'En tareas: Lleva una bitácora escrita de errores donde anotes qué falló en un ejercicio, cuál fue la causa lógica y cómo evitarlo la próxima vez.',
                    'En exámenes: Estructura tus respuestas argumentativas con el formato "afirmación, evidencia y conclusión" para asegurar rigor lógico en cada párrafo.'
                ],
                bueno: [
                    'En clase: Toma notas críticas separando en dos columnas los hechos o postulados del autor y tus propios cuestionamientos o contraejemplos.',
                    'En tareas: Escribe análisis comparativos o ensayos breves que integren fuentes contradictorias, justificando cuál postura es más sólida y bajo qué criterios.',
                    'En exámenes: Antes de entregar, lee tus respuestas de razonamiento buscando ambigüedades textuales o saltos implícitos y añade conectores lógicos precisos.'
                ]
            }
        },
        velocidad: {
            visual: {
                por_mejorar: [
                    'En clase: Revisa las diapositivas o gráficos del tema 10 minutos antes de entrar para que tu cerebro ya reconozca las imágenes y no se sature al verlas por primera vez.',
                    'En tareas: Usa una plantilla visual fija (mismos colores, mismos recuadros) para tus resúmenes y así evitar perder tiempo decidiendo cómo organizar cada tema.',
                    'En exámenes: Escanea visualmente todo el examen en los primeros 2 minutos para marcar con un símbolo las preguntas rápidas y resolverlas primero.'
                ],
                intermedio: [
                    'En clase: Crea un conjunto estándar de íconos y abreviaturas gráficas (flechas, signos de igual, símbolos de alerta) para capturar ideas complejas al ritmo del profesor.',
                    'En tareas: Practica ejercicios de reconocimiento rápido usando tarjetas visuales con temporizador para identificar fórmulas, estructuras o patrones en menos de 10 segundos.',
                    'En exámenes: Agrupa visualmente la información clave de los enunciados largos mediante corchetes o subrayados rápidos para extraer los datos sin releer todo el párrafo.'
                ],
                bueno: [
                    'En clase: Esquematiza en tiempo real mientras avanza la exposición, dejando espacios calculados para añadir detalles sin frenar tu comprensión global.',
                    'En tareas: Realiza simulacros cronometrados interpretando gráficas, tablas o diagramas complejos para reducir tu tiempo de lectura de datos manteniendo alta precisión.',
                    'En exámenes: Aprovecha el tiempo ahorrado al dominar esquemas rápidos para hacer una segunda revisión visual enfocada únicamente en signos, unidades y preguntas sin responder.'
                ]
            },
            auditivo: {
                por_mejorar: [
                    'En clase: Siéntate en las primeras filas para recibir el audio claro y directo del profesor, reduciendo el tiempo que tarda tu cerebro en descifrar palabras entre el ruido.',
                    'En tareas: Usa la función de dictado por voz para sacar el primer borrador de tus tareas o ideas y luego edítalo con calma, evitando bloqueos al arrancar.',
                    'En exámenes: Marca tu propio ritmo con una pausa mental breve después de cada bloque de preguntas para evitar que la presión acelere tu lectura y cause errores.'
                ],
                intermedio: [
                    'En clase: Entrena la escucha selectiva captando primero la idea central de cada intervención del docente y dejando los detalles secundarios para completarlos después.',
                    'En tareas: Repasa conceptos con audios o videos académicos a velocidad 1.25x cuando ya conozcas la base, pausando solo en los puntos nuevos.',
                    'En exámenes: Practica responder cuestionarios orales cronometrados con un compañero para agilizar el tiempo entre escuchar/leer una pregunta y formular la respuesta.'
                ],
                bueno: [
                    'En clase: Toma apuntes sintéticos escuchando bloques completos de explicación antes de escribir, procesando la idea entera en lugar de palabra por palabra.',
                    'En tareas: Haz rondas relámpago de preguntas y respuestas en grupo (30 segundos máximo por respuesta) para entrenar agilidad mental bajo presión.',
                    'En exámenes: Usa tu rapidez verbal interna para descartar distractores de opción múltiple en segundos y reservar el grueso del tiempo a los reactivos de mayor peso.'
                ]
            },
            kinestesico: {
                por_mejorar: [
                    'En clase: Ten listos tus materiales abiertos en la página correcta antes de que inicie la sesión para evitar perder el hilo en los primeros minutos.',
                    'En tareas: Divide los ejercicios largos en series cortas de 15 minutos con meta concreta (por ejemplo, resolver 3 problemas) para activar un ritmo constante sin abrumarte.',
                    'En exámenes: Si una pregunta te frena más de 2 minutos, márcala físicamente, pasa de inmediato a la siguiente y vuelve después con la mente despejada.'
                ],
                intermedio: [
                    'En clase: Practica la toma rápida de notas manuales usando abreviaturas propias que puedas escribir con fluidez sin despegarte de la explicación.',
                    'En tareas: Resuelve tandas de ejercicios mecánicos repetitivos con cronómetro para automatizar los pasos básicos y liberar velocidad para el análisis.',
                    'En exámenes: Haz simulacros previos en condiciones reales (mismo escritorio, mismo tiempo límite y con papel y lápiz) para que tu cuerpo y mente automaticen el ritmo de la prueba.'
                ],
                bueno: [
                    'En clase: Realiza ejercicios prácticos en paralelo a la demostración del docente para reducir al mínimo la brecha entre comprender un método y ejecutarlo.',
                    'En tareas: Entrena con retos contrarreloj progresivos (reduciendo 10% del tiempo disponible cada semana) en prácticas de laboratorio, programación o resolución de problemas.',
                    'En exámenes: Implementa una estrategia de dos pasadas rápidas: completa primero el 100% de los ejercicios ejecutables al instante y dedica la segunda vuelta a los retos complejos.'
                ]
            },
            lector: {
                por_mejorar: [
                    'En clase: Haz una lectura rápida (títulos, subtítulos y negritas) del tema un día antes para que el vocabulario técnico no frene tu comprensión durante la clase.',
                    'En tareas: Usa listas de verificación simples antes de redactar para saber exactamente qué puntos incluir y no quedarte atascado revisando instrucciones.',
                    'En exámenes: Lee primero la pregunta concreta al final de los casos largos y luego busca en el texto únicamente los datos necesarios para responderla.'
                ],
                intermedio: [
                    'En clase: Crea tu propio sistema de taquigrafía o abreviaturas consistentes para términos frecuentes de tu carrera y pásalos en limpio solo si es necesario.',
                    'En tareas: Practica técnicas de lectura rápida (skimming para ideas generales y scanning para datos puntuales) al revisar artículos académicos extensos.',
                    'En exámenes: Escribe respuestas directas y estructuradas en oraciones cortas, evitando rodeos que consumen minutos valiosos sin sumar calificación.'
                ],
                bueno: [
                    'En clase: Redacta resúmenes ejecutivos de 5 líneas en los últimos 3 minutos de la clase para entrenar la síntesis veloz de información densa.',
                    'En tareas: Usa bloques de escritura cronometrada (freewriting enfocado) para producir borradores de ensayos o reportes en la mitad de tiempo y dedicar el resto a pulir calidad.',
                    'En exámenes: Dosifica los minutos por punto de calificación desde el inicio y redacta primero esquemas clave en todas las preguntas abiertas antes de desarrollarlas a fondo.'
                ]
            }
        },
        atencion: {
            visual: {
                por_mejorar: [
                    'En clase: Siéntate cerca del frente y lejos de ventanas o pasillos para reducir estímulos visuales externos que compitan con el pizarrón.',
                    'En tareas: Despeja por completo tu escritorio dejando solo el material de la materia actual y oculta pestañas o notificaciones en tu pantalla.',
                    'En exámenes: Usa una hoja en blanco o regla para tapar las preguntas que aún no estás contestando y enfocar tu vista únicamente en el reactivo actual.'
                ],
                intermedio: [
                    'En clase: Mantén la vista anclada al apoyo visual del docente y usa un marcador para resaltar en tiempo real solo las 3 ideas más relevantes por página.',
                    'En tareas: Coloca un temporizador visual visible sobre tu escritorio (bloques de 25 a 35 minutos) para percibir el avance del tiempo sin distraerte mirando el celular.',
                    'En exámenes: Haz una marca visual clara en los datos clave de cada reactivo (unidades, negaciones como "NO" o "EXCEPTO") para evitar errores por descuido.'
                ],
                bueno: [
                    'En clase: Alterna deliberadamente entre observar la explicación visual y sintetizar en tu cuaderno cada 5 minutos para sostener atención activa durante sesiones de dos horas.',
                    'En tareas: Organiza tu espacio digital con escritorios virtuales separados (uno exclusivo para estudio, otro para ocio) para mantener concentración profunda en proyectos largos.',
                    'En exámenes: Realiza una inspección visual final enfocada por capas: primero revisa que no haya preguntas en blanco, luego verifica cálculos o palabras clave.'
                ]
            },
            auditivo: {
                por_mejorar: [
                    'En clase: Evita sentarte junto a grupos que platiquen y enfócate en seguir el tono y las pausas del profesor como guía de tu concentración.',
                    'En tareas: Estudia en un lugar silencioso o utiliza ruido blanco, sonidos de lluvia o música instrumental sin letra para bloquear ruidos impredecibles.',
                    'En exámenes: Si hay ruido ambiental en el aula, usa tapones discretos si están permitidos o enfoca tu atención en tu propia lectura silenciosa palabra por palabra.'
                ],
                intermedio: [
                    'En clase: Escucha activamente buscando responder dos preguntas mentales durante toda la sesión: "¿cuál es la idea principal ahora?" y "¿cómo se liga con lo anterior?".',
                    'En tareas: Usa señales auditivas suaves (una alarma discreta al inicio y fin de cada bloque de estudio) para condicionar a tu cerebro a entrar y salir del modo enfoque.',
                    'En exámenes: Lee mentalmente cada enunciado a un ritmo pausado y constante para impedir que tu mente salte palabras importantes por apresuramiento.'
                ],
                bueno: [
                    'En clase: Identifica cambios de énfasis o repeticiones en la voz del docente como pistas de contenido evaluable, manteniendo la escucha sostenida incluso en temas áridos.',
                    'En tareas: Aprovecha tus momentos de mayor claridad mental para lecturas complejas y reserva los audios o clases grabadas para horas de menor energía sin perder foco.',
                    'En exámenes: Aplica una pausa de respiración silenciosa de 15 segundos cada 30 minutos de prueba para resetear tu atención sostenida sin perder el ritmo.'
                ]
            },
            kinestesico: {
                por_mejorar: [
                    'En clase: Usa un objeto discreto y silencioso en tu mano (como girar un bolígrafo sin hacer clic o apretar suavemente un objeto pequeño) para canalizar la inquietud sin desconectarte.',
                    'En tareas: Trabaja en bloques cortos de 20 minutos seguidos de 5 minutos de pausa activa (estirarte, caminar por agua) en lugar de revisar redes sociales.',
                    'En exámenes: Mantén una postura erguida con ambos pies apoyados en el piso y realiza breves estiramientos de hombros o manos cuando sientas que tu atención cae.'
                ],
                intermedio: [
                    'En clase: Mantén tu cuerpo involucrado en la clase tomando apuntes manuales activos, señalando diagramas o respondiendo ejercicios rápidos en tu cuaderno.',
                    'En tareas: Alterna tu posición de estudio entre sesiones (por ejemplo, leer de pie o caminar al repasar y sentarte para resolver ejercicios escritos) para renovar el enfoque.',
                    'En exámenes: Sigue los renglones con la punta del lápiz mientras lees enunciados complejos para fijar tu atención física y mental en cada detalle.'
                ],
                bueno: [
                    'En clase: Convierte las clases largas en retos activos fijándote la meta de formular al menos una duda pertinente o un ejemplo aplicado cada 30 minutos.',
                    'En tareas: Diseña ciclos de trabajo de 45 a 50 minutos con pausas físicas estructuradas para sostener jornadas intensas de entrega de proyectos sin agotamiento.',
                    'En exámenes: Administra tu energía física durante evaluaciones extensas (hidratación previa, descanso adecuado y micro-pausas de 10 segundos) para mantener el mismo nivel de atención de principio a fin.'
                ]
            },
            lector: {
                por_mejorar: [
                    'En clase: Ten una "hoja de pensamientos distractores" a un lado para anotar rápido cualquier pendiente que te venga a la mente y volver de inmediato a la clase.',
                    'En tareas: Escribe en un papel una sola meta específica antes de empezar ("terminar ejercicios 1 al 5") y mírala cada vez que sientas impulso de cambiar de actividad.',
                    'En exámenes: Subraya las instrucciones clave de cada sección antes de contestar para no responder algo distinto a lo solicitado por distracción.'
                ],
                intermedio: [
                    'En clase: Anota preguntas breves en el margen cada vez que notes que tu mente empieza a divagar; el acto de redactar una pregunta te devuelve al tema.',
                    'En tareas: Haz anotaciones activas al margen de tus lecturas (una frase resumen cada dos párrafos) para evitar leer en piloto automático sin retener nada.',
                    'En exámenes: Lleva un registro escrito rápido en una esquina de tu hoja borrador con los números de preguntas pendientes o dudosas para volver a ellas con orden.'
                ],
                bueno: [
                    'En clase: Sintetiza periódicamente cada bloque temático en una frase de cierre escrita, manteniendo vigilancia continua sobre la estructura completa de la sesión.',
                    'En tareas: Planifica tus sesiones por escrito con bloques temáticos definidos y evalúa al final qué nivel de concentración lograste para ajustar tus horarios óptimos.',
                    'En exámenes: Dedica los últimos minutos a una lectura cuidadosa de tus propias respuestas buscando palabras omitidas, errores de redacción o instrucciones parciales.'
                ]
            }
        }
    };

    function pintarTarjeta(prueba, resultado) {
        const card = document.getElementById('result-' + prueba);
        if (!card) return;
        const levelEl = card.querySelector('.level');
        const barFill = card.querySelector('.bar-fill');
        const lista = card.querySelector('.rec-list');
        const recTitle = card.querySelector('.rec-title');

        if (!resultado) {
            // Todavía no ha completado esta prueba
            levelEl.textContent = 'Pendiente';
            levelEl.className = 'level';
            levelEl.style.background = '#ECEDEF';
            levelEl.style.color = '#6B7280';
            barFill.style.width = '0%';
            if (recTitle) recTitle.textContent = 'Recomendaciones';
            lista.innerHTML = '<li style="list-style:none; margin-left:-18px; color:#6B7280; font-size:12.5px;">Completa esta prueba para recibir tus recomendaciones.</li>';
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

        // No mostrar recomendaciones hasta que el alumno realice el cuestionario de tipo de aprendizaje
        const estilo = estiloGuardado();
        if (!estilo || !ESTILOS[estilo]) {
            if (recTitle) recTitle.textContent = 'Recomendaciones';
            lista.innerHTML = '<li style="list-style:none; margin-left:-18px; background:#F8FAFC; border:1px dashed #CBD5E1; padding:11px 13px; border-radius:8px; color:#64748B; font-size:12px; line-height:1.45;">' +
                '<span style="font-size:13px; margin-right:4px;">🔒</span> ' +
                'Las recomendaciones se mostrarán una vez que realices el cuestionario de tipo de aprendizaje. Cuestionario al final de la página.' +
                '</li>';
            return;
        }

        const nombreEstilo = ESTILOS[estilo].nombre;
        if (recTitle) {
            recTitle.textContent = 'Recomendaciones (' + nombreEstilo + ' · ' + nivel.texto + ')';
        }

        const recs = RECOMENDACIONES[prueba] && RECOMENDACIONES[prueba][estilo] && RECOMENDACIONES[prueba][estilo][nivel.id];
        if (recs && recs.length > 0) {
            lista.innerHTML = recs.map((t) => '<li>' + formatearRecomendacion(t) + '</li>').join('');
        } else {
            lista.innerHTML = '<li>Sin recomendaciones registradas para este nivel.</li>';
        }
    }

    function refrescarTarjetas() {
        PRUEBAS.forEach((p) => {
            const res = datosResumen ? datosResumen[p] : null;
            pintarTarjeta(p, res);
        });
    }

    // ============================================================
    // ESTILO DE APRENDIZAJE (visual / auditivo / lector / kinestésico)
    // 10 preguntas; cada opción suma a un estilo. Gana el que más suma
    // (en empate, el primero en el orden visual, auditivo, lector, kinestésico).
    // ============================================================
    const PREGUNTAS_ESTILO = [
        {
            q: 'Cuando quieres aprender a usar un programa o aparato nuevo, prefieres...',
            o: [
                'Ver un video tutorial con diagramas o demostración visual',
                'Que alguien te lo explique oralmente paso a paso',
                'Leer el manual de usuario, la guía escrita o los instructivos detallados',
                'Empezar a usarlo directamente y descubrirlo sobre la marcha'
            ]
        },
        {
            q: 'Para recordar información importante (como un número de teléfono o una clave)...',
            o: [
                'La visualizo en mi mente como si estuviera escrita o dibujada',
                'La repito varias veces en voz alta o como una rima',
                'La anoto en mi libreta o la escribo textualmente para memorizarla',
                'La marco con los dedos en el teclado o la asocio con un movimiento'
            ]
        },
        {
            q: 'En clase aprendes mejor cuando el profesor...',
            o: [
                'Muestra diapositivas con esquemas, gráficos y mapas conceptuales',
                'Explica con claridad y abre espacios de diálogo y discusión oral',
                'Proporciona lecturas, apuntes estructurados o escribe notas en el pizarrón',
                'Realiza dinámicas, resolución práctica de problemas o actividades aplicadas'
            ]
        },
        {
            q: 'Al prepararte para un examen difícil, tu técnica favorita es...',
            o: [
                'Hacer mapas mentales con colores, tablas comparativas y símbolos',
                'Explicarle el tema a un compañero o grabarte resumiéndolo en voz alta',
                'Releer el libro o apuntes y redactar cuestionarios y resúmenes escritos',
                'Resolver ejercicios prácticos, simuladores o moverte mientras repasas'
            ]
        },
        {
            q: 'Cuando visitas una ciudad desconocida y buscas una dirección, prefieres...',
            o: [
                'Consultar un mapa interactivo o una imagen satelital de la zona',
                'Preguntar a personas del lugar y seguir sus indicaciones orales',
                'Leer las instrucciones escritas paso a paso o la lista de nombres de calles',
                'Caminar y orientarte por intuición recorriendo el terreno'
            ]
        },
        {
            q: 'Al elegir qué platillo pedir en un restaurante, te decides más por...',
            o: [
                'Las fotografías e imágenes atractivas del menú',
                'Las recomendaciones que el mesero o tus acompañantes te describen',
                'Leer la descripción detallada de los ingredientes y el texto del menú',
                'Recordar la sensación y sabor de platillos que ya has probado físicamente'
            ]
        },
        {
            q: 'Te distraes más fácilmente durante tus sesiones de estudio cuando...',
            o: [
                'Hay desorden visual, luces parpadeantes o mucho movimiento alrededor',
                'Se escuchan ruidos molestos, conversaciones o música con letra',
                'La lectura es confusa, faltan textos explicativos o el material está mal redactado',
                'Llevas demasiado tiempo sentado sin poder moverte ni cambiar de postura'
            ]
        },
        {
            q: 'Cuando compras un mueble o producto para armar, lo primero que haces es...',
            o: [
                'Mirar detenidamente las ilustraciones y planos de ensamble',
                'Pedirle a alguien que te diga cómo se hace o buscar un audio explicativo',
                'Leer minuciosamente la lista de piezas y los pasos numerados del manual',
                'Separar las piezas con las manos y empezar a ensamblarlas directamente'
            ]
        },
        {
            q: 'Cuando un amigo te cuenta una anécdota emocionante, sueles...',
            o: [
                'Imaginarte la escena completa como si estuvieras viendo una película',
                'Concentrarte en su tono de voz, expresiones y sonidos de la narración',
                'Prestar atención a los datos precisos, nombres y relacionarlo con algo que leíste',
                'Sentir empatía física con las emociones, gestos y reacciones corporales'
            ]
        },
        {
            q: 'Si tienes que dar una presentación sobre un proyecto escolar, prefieres apoyarte en...',
            o: [
                'Diapositivas llenas de imágenes, infografías y diagramas claros',
                'Tu fluidez verbal para hablar, debatir y responder preguntas',
                'Un guion escrito con notas precisas, citas y referencias bibliográficas',
                'Una demostración en vivo, maqueta o muestra física interactiva'
            ]
        }
    ];
    const ESTILOS = {
        visual: {
            nombre: 'Visual',
            rec: 'Apóyate en mapas mentales, esquemas, colores y subrayado; convierte los textos en diagramas y usa videos o imágenes para estudiar.'
        },
        auditivo: {
            nombre: 'Auditivo',
            rec: 'Explica los temas en voz alta, graba tus propios resúmenes para escucharlos, estudia en grupo y apóyate en podcasts o debates.'
        },
        lector: {
            nombre: 'Lector/Escritor',
            rec: 'Aprende leyendo libros, artículos y tomando notas detalladas; redacta resúmenes, elabora listas, fichas de conceptos y reescribe tus apuntes.'
        },
        kinestesico: {
            nombre: 'Kinestésico',
            rec: 'Estudia en movimiento: haz ejercicios prácticos, laboratorios, maquetas o simulaciones, escribe a mano y toma descansos activos entre bloques.'
        }
    };
    const ORDEN_ESTILOS = ['visual', 'auditivo', 'lector', 'kinestesico'];
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
                '<p>Responde 10 preguntas rápidas para saber si aprendes mejor de forma visual, auditiva, lectora/escritora o kinestésica y recibir una recomendación extra.</p>' +
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
            '<div class="quiz-error" id="quiz-error" hidden>Responde las 10 preguntas para ver tu resultado.</div>' +
            '<button type="submit" class="style-btn">Ver mi estilo</button>' +
            '<button type="button" class="style-btn secondary" id="btn-cancelar-estilo">Cancelar</button></form>';
        document.getElementById('btn-cancelar-estilo').addEventListener('click', pintarEstilo);
        document.getElementById('form-estilo').addEventListener('submit', (e) => {
            e.preventDefault();
            const cuenta = { visual: 0, auditivo: 0, lector: 0, kinestesico: 0 };
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
            refrescarTarjetas();

            if (estudianteId) {
                const nombreEstilo = ESTILOS[ganador] ? ESTILOS[ganador].nombre : ganador;
                fetch('/api/estudiantes/' + encodeURIComponent(estudianteId) + '/tipo-aprendizaje', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tipoAprendizaje: nombreEstilo })
                }).catch(() => {});
            }
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

    // ============================================================
    // Gestión del grupo del estudiante
    // ============================================================
    const inputCodigo = document.getElementById('code');
    const btnUnirseGrupo = document.getElementById('btnUnirseGrupo');
    const introGrupo = document.getElementById('introGrupo');
    const formGrupo = document.getElementById('formGrupo');
    const cardGrupoUnido = document.getElementById('cardGrupoUnido');
    const lblGrupoCodigo = document.getElementById('lblGrupoCodigo');
    const lblDocenteNombre = document.getElementById('lblDocenteNombre');
    const btnCambiarGrupo = document.getElementById('btnCambiarGrupo');

    function mostrarGrupoUnido(codigo, docente) {
        if (!cardGrupoUnido || !formGrupo) return;
        if (lblGrupoCodigo) lblGrupoCodigo.textContent = codigo || '---';
        if (lblDocenteNombre) lblDocenteNombre.textContent = docente || 'Docente asignado';
        formGrupo.style.display = 'none';
        if (introGrupo) introGrupo.style.display = 'none';
        cardGrupoUnido.style.display = 'block';
    }

    function mostrarFormularioGrupo() {
        if (!cardGrupoUnido || !formGrupo) return;
        cardGrupoUnido.style.display = 'none';
        if (introGrupo) introGrupo.style.display = 'block';
        formGrupo.style.display = 'flex';
        if (inputCodigo) {
            inputCodigo.value = '';
            inputCodigo.focus();
        }
    }

    if (btnCambiarGrupo) {
        btnCambiarGrupo.addEventListener('click', () => {
            mostrarFormularioGrupo();
        });
    }

    const grupoGuardado = localStorage.getItem('grupoCodigo');
    const docenteGuardado = localStorage.getItem('docenteNombre');
    if (grupoGuardado) {
        if (inputCodigo) inputCodigo.value = grupoGuardado;
        mostrarGrupoUnido(grupoGuardado, docenteGuardado);
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
                if (data.docente) {
                    localStorage.setItem('docenteNombre', data.docente);
                }
                inputCodigo.value = data.codigo;
                mostrarGrupoUnido(data.codigo, data.docente);
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
        datosResumen = {
            memoria: { puntaje: 86 },
            atencion: { puntaje: 58 },
            razonamiento: { puntaje: 78 },
            velocidad: { puntaje: 34 }
        };
        refrescarTarjetas();
    } else {
        refrescarTarjetas();
        // Cargar resultados reales del estudiante desde SQL Server
        fetch('/api/estudiantes/' + encodeURIComponent(estudianteId) + '/resumen')
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                if (!data || !data.resumen) return;
                if (data.grupoCodigo) {
                    localStorage.setItem('grupoCodigo', data.grupoCodigo);
                    if (data.docente) {
                        localStorage.setItem('docenteNombre', data.docente);
                    }
                    if (inputCodigo) inputCodigo.value = data.grupoCodigo;
                    mostrarGrupoUnido(data.grupoCodigo, data.docente || localStorage.getItem('docenteNombre') || '');
                }
                if (data.tipoAprendizaje) {
                    let claveNormalizada = data.tipoAprendizaje.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    if (claveNormalizada.includes('lector') || claveNormalizada.includes('escritor')) claveNormalizada = 'lector';
                    if (ESTILOS[claveNormalizada]) {
                        try { localStorage.setItem(CLAVE_ESTILO, claveNormalizada); } catch (e) {}
                        pintarEstilo();
                    }
                } else {
                    try { localStorage.removeItem(CLAVE_ESTILO); } catch (e) {}
                    pintarEstilo();
                }
                const tag = document.getElementById('results-tag');
                tag.textContent = 'Tus resultados';
                tag.style.color = '#1E9E63';
                tag.style.background = '#E3F5EC';
                document.getElementById('results-sub').textContent = estudianteNombre
                    ? 'Este es tu perfil cognitivo, ' + estudianteNombre + ', según tus pruebas completadas.'
                    : 'Este es tu perfil cognitivo según tus pruebas completadas.';
                datosResumen = data.resumen;
                refrescarTarjetas();
                PRUEBAS.forEach((p) => { if (data.resumen[p]) bloquearCompletada(p); });
            })
            .catch(() => { });
    }
};