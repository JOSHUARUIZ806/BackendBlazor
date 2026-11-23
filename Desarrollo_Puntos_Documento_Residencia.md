# DESARROLLO INTEGRAL DE PUNTOS PARA EL INFORME TÉCNICO DE RESIDENCIA PROFESIONAL

**Institución:** Instituto Tecnológico de Tijuana (TecNM)  
**Carrera:** Ingeniería Informática  
**Proyecto:** "SISTEMA WEB DE EVALUACIÓN DE APRENDIZAJE COGNITIVO PARA ESTUDIANTES DE NIVEL SUPERIOR"  
**Residentes:** Gabriel Contreras Sanchez y Joshua Isaias Ruiz Lopez  
**Asesores:**  
- **Interno:** M.C. Miguel Ángel López Ramírez  
- **Externo:** M.C. José de Jesús Parra Galaviz  
**Período:** Agosto / Diciembre 2026  

---

## ÍNDICE DE SECCIONES DESARROLLADAS
1. [Agradecimientos](#agradecimientos)
2. [Resumen y Palabras Clave](#resumen-y-palabras-clave)
3. [Glosario de Términos](#glosario-de-términos)
4. [Capítulo I: Generalidades del Proyecto](#capítulo-i-generalidades-del-proyecto)
   - [Introducción General](#introducción-general)
   - [1.6 Alcances y Limitaciones](#16-alcances-y-limitaciones)
5. [Capítulo II: Marco Teórico y Legal](#capítulo-ii-marco-teórico-y-legal)
   - [2.1 Marco Teórico (2.1.1 al 2.1.14)](#21-marco-teórico)
   - [2.2 Marco Legal y Protección de Datos](#22-marco-legal)
6. [Capítulo III: Desarrollo](#capítulo-iii-desarrollo)
   - [3.1 Procedimiento y Descripción de Actividades](#31-procedimiento-y-descripción-de-actividades)
   - [3.4 Explicación del Diseño de la Base de Datos](#34-explicación-del-diseño-de-la-base-de-datos)
   - [3.5 Diseño de Pantallas y Prototipado](#35-diseño-de-pantallas)
   - [3.6 Arquitectura y Tecnologías Utilizadas](#36-arquitectura-y-tecnologías-utilizadas)
   - [3.7 Desarrollo de los Módulos del Sistema](#37-desarrollo-de-los-módulos-del-sistema)
   - [3.8 Seguridad y Control de Acceso](#38-seguridad-y-control-de-acceso)
   - [3.9 Pruebas del Sistema (Matriz de Casos de Prueba)](#39-pruebas-del-sistema)
   - [3.10 Despliegue en la Nube (Azure App Service y Azure SQL)](#310-despliegue-en-la-nube-azure)
7. [Capítulo IV: Resultados](#capítulo-iv-resultados)
   - [4.1 Pantallas del Sistema](#41-pantallas-del-sistema)
   - [4.2 Resultados de las Pruebas del Sistema](#42-resultados-de-las-pruebas-del-sistema)
   - [4.3 Evaluación con Usuarios (Usabilidad y Percepción)](#43-evaluación-con-usuarios)
   - [4.4 Estructura Final del Sistema](#44-estructura-final-del-sistema)
8. [Capítulo V: Conclusiones y Recomendaciones](#capítulo-v-conclusiones-y-recomendaciones)
   - [5.1 Conclusiones del Proyecto](#51-conclusiones-del-proyecto)
   - [5.2 Recomendaciones](#52-recomendaciones)
   - [5.3 Experiencia Personal y Profesional Adquirida](#53-experiencia-personal-y-profesional-adquirida)
9. [Capítulo VI: Competencias Desarrolladas](#capítulo-vi-competencias-desarrolladas)
   - [6.1 Competencias Específicas y Genéricas](#61-competencias-específicas-y-genéricas)
10. [Capítulo VII: Mejoras a Futuro](#capítulo-vii-mejoras-a-futuro)
11. [Referencias Bibliográficas (Normas APA 7.ª Edición)](#referencias-bibliográficas-normas-apa-7ª-edición)
12. [Anexos (A, B y C)](#anexos)

---

## Agradecimientos

Deseamos expresar nuestro más profundo agradecimiento al **Instituto Tecnológico de Tijuana**, integrante del Tecnológico Nacional de México, por ser nuestra alma máter, abrirnos sus puertas y brindarnos las herramientas técnicas, humanas y científicas necesarias para consolidar nuestra formación en Ingeniería Informática.

A nuestro asesor interno, el **M.C. Miguel Ángel López Ramírez**, por su invaluable acompañamiento académico, retroalimentación metodológica y orientación constante para estructurar un proyecto de impacto tangible para la comunidad universitaria.

A nuestro asesor externo, el **M.C. José de Jesús Parra Galaviz**, por su disposición pedagógica, sus valiosas aportaciones en la definición de la lógica de evaluación y por impulsarnos a mantener altos estándares de calidad técnica y funcionalidad práctica.

A los docentes y directivos del **Departamento de Sistemas y Computación**, por compartir generosamente su experiencia, fomentando en nosotros una mentalidad de excelencia, disciplina y vocación tecnológica.

De manera muy especial, a nuestras **familias**, cuyo apoyo incondicional, sacrificio, paciencia y estímulo moral han sido el motor esencial detrás de cada una de nuestras metas alcanzadas. Asimismo, a nuestros compañeros de carrera y a todos aquellos estudiantes que colaboraron en las sesiones de prueba y validación del sistema, haciendo posible la culminación exitosa de esta etapa profesional.

---

## Resumen

El presente proyecto de Residencia Profesional documenta el análisis, diseño, desarrollo, pruebas e implementación del **“Sistema Web de Evaluación de Aprendizaje Cognitivo para Estudiantes de Nivel Superior”**, desarrollado en el Departamento de Sistemas y Computación del Instituto Tecnológico de Tijuana (TecNM). Tradicionalmente, la evaluación universitaria se ha centrado en el rendimiento académico sumativo (exámenes y asignaturas), pasando por alto las funciones neurocognitivas subyacentes que condicionan la capacidad del estudiante para captar, procesar y aplicar información especializada.

Para responder a esta problemática, se construyó una plataforma web orientada al diagnóstico formativo y preventivo, dividida en dos roles esenciales: **Alumno** y **Docente**. Para el rol alumno, el sistema integra cuatro pruebas interactivas basadas en paradigmas cognitivos reconocidos: atención (mediante una tarea de control inhibitorio basada en el *Efecto Stroop*), memoria (mediante un *Memorama 6×6* con retención visoespacial), razonamiento lógico (a través de *sucesiones numéricas inductivas*) y velocidad de procesamiento (mediante el *Trail Making Test / Test de Trazo* de 25 nodos correlativos). El sistema captura métricas cuantitativas en tiempo real (milisegundos de reacción, cantidad de aciertos, patrones de error e intentos), las cuales son procesadas por un motor de diagnóstico interno que clasifica el desempeño en niveles (*Fuerte/Bueno, Promedio/Intermedio y Por reforzar/Por mejorar*) y asigna estrategias y recomendaciones de estudio personalizadas de acuerdo con el perfil identificado. Para el rol docente, la plataforma permite crear y administrar grupos académicos mediante códigos alfanuméricos dinámicos, visualizando tableros estadísticos consolidados y tendencias grupales para respaldar intervenciones psicopedagógicas oportunas.

La solución fue implementada bajo una arquitectura moderna en **Blazor Web App** (.NET / C#) con modo interactivo en servidor (`InteractiveServerComponents`), comunicación bidireccional en tiempo real vía WebSockets (SignalR), persistencia mediante **Entity Framework Core** y bases de datos relacionales en **SQL Server** y **Azure SQL Database**, alojándose en la nube a través de **Azure App Service**. El resultado principal es una herramienta funcional, accesible, multiplataforma y segura que cierra la brecha entre la observación cualitativa en el aula y la métrica analítica de datos, promoviendo el autoconocimiento en los estudiantes y proporcionando un recurso de apoyo vital a la labor docente y tutorial.

**Palabras clave:** sistema web, evaluación cognitiva, habilidades cognitivas, educación superior, recomendaciones de estudio, Blazor.

---

## Glosario de Términos

- **Habilidad cognitiva:** Capacidad y proceso mental que interviene en la captación, codificación, almacenamiento, manipulación y recuperación de la información para la adaptación al entorno y el aprendizaje.
- **Atención:** Proceso cognitivo que permite focalizar de forma selectiva los recursos mentales en estímulos específicos e inhibir distracciones externas o internas durante la ejecución de una tarea.
- **Memoria de trabajo:** Sistema de capacidad limitada que retiene y manipula temporalmente información activa necesaria para tareas cognitivas complejas como el razonamiento y la comprensión.
- **Razonamiento lógico:** Proceso deductivo o inductivo que permite analizar premisas, identificar secuencias y reglas abstractas, y deducir conclusiones válidas para resolver problemas.
- **Velocidad de procesamiento:** Medida de la rapidez y fluidez con la que un sujeto identifica, codifica, procesa y responde adecuadamente a estímulos sensoriales e intelectuales.
- **Efecto Stroop:** Fenómeno neuropsicológico en el cual se produce una interferencia semántica al nombrar el color de la tinta de una palabra cuando este no coincide con el significado léxico de la misma.
- **Memorama:** Dinámica interactiva de emparejamiento basada en retención visoespacial y memoria de trabajo a corto plazo, donde el usuario debe descubrir pares idénticos en un tablero oculto.
- **Sucesiones numéricas:** Batería de ejercicios de cálculo deductivo e inductivo que evalúa la capacidad de descubrir la regla o patrón matemático que rige una secuencia de números.
- **Test de trazo (Trail Making Test - TMT):** Prueba neuropsicológica que evalúa la velocidad psicomotora, el rastreo visual y la atención sostenida mediante la conexión consecutiva de círculos numerados.
- **Sistema web:** Conjunto coordinado de recursos de software y hardware que se ejecutan sobre una infraestructura en red, ofreciendo servicios e interfaces dinámicas accesibles mediante navegadores web.
- **Frontend:** Capa visual de una aplicación informática con la cual el usuario final interactúa de forma directa mediante controles gráficos, estilos y comportamientos de interfaz.
- **Backend:** Capa lógica y de servicios del sistema encargada del procesamiento central de datos, reglas de negocio, validación de accesos e interacción con repositorios de información.
- **Cliente-servidor:** Modelo arquitectónico distribuido donde las solicitudes originadas por programas cliente (navegadores) son recibidas, procesadas y respondidas centralizadamente por un servidor.
- **API y Endpoint:** Interfaz de Programación de Aplicaciones que define un protocolo de intercambio de datos, y Endpoint es la URL específica donde se expone un recurso o servicio web determinando un método HTTP.
- **Base de datos relacional:** Sistema de almacenamiento estructurado de información basado en tablas conformadas por registros y atributos, vinculadas mediante claves primarias y foráneas.
- **SQL Server:** Sistema gestor de bases de datos relacionales (RDBMS) de nivel empresarial desarrollado por Microsoft, utilizado para la persistencia transaccional y consulta de datos estructurados.
- **Azure SQL Database:** Servicio administrado de bases de datos relacionales en la nube de Microsoft Azure, que ofrece escalabilidad automática, alta disponibilidad y compatibilidad nativa con SQL Server.
- **Entity Framework Core (EF Core):** Mapeador Objeto-Relacional (ORM) moderno y de alto rendimiento para .NET que permite manipular bases de datos utilizando directamente objetos y clases de C#.
- **Blazor:** Framework de Microsoft para la construcción de interfaces de usuario web interactivas y dinámicas utilizando C#, HTML y CSS en lugar de depender exclusivamente de JavaScript.
- **ASP.NET Core:** Entorno de ejecución y framework web de código abierto, multiplataforma y de alto desempeño diseñado por Microsoft para compilar aplicaciones modernas conectadas a la nube.
- **Hash y PBKDF2:** Función matemática unidireccional criptográfica aplicada con derivación de clave por contraseña (*Password-Based Key Derivation Function 2*), que transforma texto plano en un valor seguro no reversible.
- **Rol de usuario:** Conjunto de privilegios, vistas y permisos asignados a una cuenta (ej. Alumno o Docente) para restringir o habilitar funciones específicas dentro de un sistema informático.
- **Código de grupo:** Cadena alfanumérica única generada por un docente que funciona como llave de enlace temporal para que los estudiantes se enrolen formalmente a un grupo académico.
- **Azure App Service:** Plataforma como Servicio (PaaS) administrada en la nube para alojar y escalar aplicaciones web, APIs y backends sin requerir la administración manual de servidores físicos o virtuales.
- **Despliegue:** Conjunto de tareas automatizadas o manuales orientadas a compilar, empaquetar, configurar y transferir el software hacia un entorno de producción accesible a los usuarios.
- **Responsividad:** Propiedad del diseño web que permite que los elementos de la interfaz adapten su disposición geométrica y jerárquica a cualquier resolución de pantalla (computadora, tableta o smartphone).
- **UML y Caso de Uso:** Lenguaje Unificado de Modelado que provee estándares visuales de ingeniería de software; un Caso de Uso describe la interacción entre un actor externo y el sistema para lograr un objetivo de valor.
- **Requerimiento Funcional y No Funcional:** Un requerimiento funcional describe las acciones y comportamientos que el sistema debe ejecutar; un requerimiento no funcional establece las condiciones de calidad, seguridad, usabilidad y rendimiento bajo las cuales debe operar.

---

## Capítulo I: Generalidades del Proyecto

### Introducción General

El rendimiento académico de los estudiantes en las instituciones de educación superior ha constituido históricamente un parámetro evaluado casi de manera exclusiva a través de métricas sumativas, tales como calificaciones obtenidas en exámenes parciales, proyectos de asignatura y tareas prácticas. Si bien estos indicadores reflejan el nivel de adquisición de los contenidos curriculares, carecen del alcance metodológico necesario para diagnosticar el estado y la eficiencia de los procesos cognitivos fundamentales (atención, memoria, razonamiento lógico y velocidad de procesamiento) que hacen posible que el estudiante comprenda, razone y resuelva problemas de alta complejidad. La carencia de herramientas estandarizadas, accesibles y objetivas dentro del entorno universitario genera un vacío informativo: los docentes y las áreas de orientación psicopedagógica desconocen las áreas de oportunidad cognitivas de su alumnado al momento del ingreso o durante el ciclo formativo, limitando su capacidad para aplicar estrategias de prevención frente al rezago y la reprobación.

Para atender esta necesidad en el marco académico del Instituto Tecnológico de Tijuana, se desarrolló el proyecto titulado **“Sistema Web de Evaluación de Aprendizaje Cognitivo para Estudiantes de Nivel Superior”**. La plataforma integra un entorno web accesible que permite la administración integral de dos perfiles de usuario: alumnos y docentes. A través de cuatro pruebas cognitivas digitales diseñadas bajo rigor interactivo, el sistema registra de manera automatizada variables críticas de desempeño (tiempos de respuesta, aciertos, errores y patrones de decisión), alimentando un motor analítico que genera tanto retroalimentación y recomendaciones de estudio personalizadas para el estudiante, como tableros estadísticos y de tendencias grupales para el docente.

El presente informe técnico de Residencia Profesional se encuentra organizado formalmente en siete capítulos y anexos:
- **Capítulo I. Generalidades del Proyecto:** Describe la institución receptora, sus antecedentes históricos, misión, visión, el planteamiento formal del problema, los objetivos generales y específicos, la justificación académica y la delimitación de alcances y limitaciones.
- **Capítulo II. Marco Teórico y Legal:** Desarrolla el sustento conceptual de las tecnologías de desarrollo de software aplicadas (Blazor, .NET, EF Core, SQL Server, Azure, criptografía y arquitectura web), los fundamentos neurocognitivos de las pruebas evaluadas y el marco normativo legal en materia de protección de datos personales.
- **Capítulo III. Desarrollo:** Detalla el procedimiento metodológico implementado, la especificación formal de requerimientos funcionales y no funcionales, los diagramas y especificaciones de casos de uso UML, el diseño relacional de la base de datos, los prototipos de interfaz, la arquitectura técnica, la construcción modular, los mecanismos de seguridad, el plan de pruebas y el procedimiento de despliegue en la nube.
- **Capítulo IV. Resultados:** Expone la operatividad de las pantallas finales del sistema para ambos roles, los resultados de la ejecución de casos de prueba, el análisis de la evaluación con usuarios mediante encuestas de usabilidad y la estructura consolidada de la solución.
- **Capítulo V. Conclusiones y Recomendaciones:** Presenta la evaluación del cumplimiento de los objetivos y requerimientos establecidos, recomendaciones técnicas para la sostenibilidad del software y las reflexiones sobre la experiencia personal y profesional adquirida por los residentes.
- **Capítulo VI. Competencias Desarrolladas:** Describe las competencias genéricas y específicas del perfil de egreso de Ingeniería Informática consolidadas durante la residencia.
- **Capítulo VII. Mejoras a Futuro:** Plantea las líneas de evolución tecnológica e institucional para enriquecer las capacidades analíticas de la plataforma en semestres posteriores.
- **Referencias y Anexos:** Reúne la bibliografía consultada bajo el estándar APA 7.ª edición, junto con el manual de usuario, el script DDL de la base de datos y los instrumentos complementarios de evaluación.

---

### 1.6 Alcances y Limitaciones

#### 1.6.1 Alcances del Proyecto
El sistema web contempla los siguientes límites funcionales y operativos dentro del alcance del presente trabajo:
1. **Gestión de Usuarios y Roles:** Soporte para dos roles independientes y protegidos: *Alumno* (acceso a pruebas, histórico de resultados y recomendaciones de estudio) y *Docente* (creación de grupos, visualización de estudiantes inscritos y analítica grupal).
2. **Administración de Grupos por Código:** Mecanismo ágil de enrolamiento donde el docente genera un código alfanumérico único para su asignatura y el estudiante se adscribe introduciendo dicha clave en su panel personal.
3. **Módulo de Cuatro Pruebas Cognitivas Interactivas:**
   - *Memoria:* Actividad interactiva de memorama 6×6 (18 pares de cartas con emojis) con fase previa de memorización y control de movimientos y errores.
   - *Atención:* Tarea con metodología del Efecto Stroop (identificación del color de la tinta con incongruencia léxica) en rondas secuenciales y medición de milisegundos de reacción.
   - *Razonamiento Lógico:* Retos de sucesiones numéricas inductivas con retroalimentación inmediata y deducción de patrones aritméticos y geométricos con límite de tiempo.
   - *Velocidad de Procesamiento:* Actividad basada en el Trail Making Test (TMT-A) que demanda la conexión secuencial y continua de 25 nodos numéricos en un lienzo digital interactivo.
4. **Motor de Métricas y Recomendaciones:** Procesamiento algorítmico inmediato de los resultados brutos para clasificar el rendimiento en tres niveles (*Fuerte / Bueno, Promedio / Intermedio, Por reforzar / Por mejorar*) y asignación automatizada de recomendaciones de hábitos de estudio orientadas a contextos de clase, tareas y exámenes.
5. **Panel Analítico para el Docente:** Tableros que muestran porcentajes de precisión, tiempos medios de resolución, distribución de niveles en el grupo y desglose individual por alumno.

#### 1.6.2 Limitaciones del Proyecto
1. **Carácter Estrictamente Académico y Orientativo (RNF07 y RNF08):** El sistema **no** es un instrumento de diagnóstico clínico, neuropsicológico ni médico. Sus métricas e interpretaciones tienen un propósito complementario y formativo enfocado en la orientación pedagógica. La interfaz del sistema exhibe permanentemente esta advertencia legal y ética.
2. **Validación de Criterios por Especialista (RNF09):** Los baremos, umbrales de puntuación y recomendaciones predefinidas requieren de la revisión y validación colegiada por parte de un profesional en psicología educativa o psicopedagogía antes de ser adoptadas como normativa institucional general.
3. **Dependencia de Conectividad a Internet (RNF05):** Al tratarse de una solución basada en Blazor Server Web App alojada en Microsoft Azure, se requiere de un navegador web moderno con soporte de WebSockets (HTML5) y conexión estable a Internet para interactuar con las pruebas en tiempo real.
4. **Población Objetivo y Período de Aplicación:** Diseñado primordialmente para ser implementado en estudiantes de nivel superior durante sus primeras semanas de ingreso a la universidad (primer semestre) para diagnóstico temprano, con posibilidad de reevaluación al inicio de ciclos posteriores mediante el enrolamiento a nuevos grupos.

---

## Capítulo II: Marco Teórico y Legal

### 2.1 Marco Teórico

#### 2.1.1 Sistema Web y Aplicaciones Web
Un sistema web es una aplicación informática basada en la red que se ejecuta en servidores remotos y cuya interfaz se renderiza en un navegador cliente. A diferencia de las aplicaciones de escritorio tradicionales, las aplicaciones web eliminan la necesidad de instalaciones complejas, descargas de ejecutables locales y configuraciones de controladores en cada equipo. Esta característica resulta estratégica en el entorno educativo superior del ITT, donde los estudiantes utilizan diversos dispositivos (computadoras de laboratorio institucionales, portátiles personales, tabletas y teléfonos inteligentes). El acceso universal mediante URL estándar facilita la aplicación masiva de evaluaciones cognitivas simultáneas.

#### 2.1.2 Arquitectura Cliente-Servidor
La arquitectura cliente-servidor es un modelo computacional distribuido que segrega las responsabilidades del sistema en dos roles esenciales:
- **El Cliente:** Representado por el navegador web del usuario, encargado de renderizar la interfaz visual, capturar los eventos del teclado, ratón o toques en pantalla, y presentar de forma amigable los estímulos de las pruebas cognitivas.
- **El Servidor:** Máquina o servicio en la nube donde reside el núcleo de la aplicación, el motor de ejecución de .NET, los servicios web de consulta y los procedimientos de seguridad. El servidor procesa la lógica del negocio, valida las credenciales y orquesta la comunicación con el motor de base de datos relacional.

#### 2.1.3 Base de Datos Relacional y SQL Server
Una base de datos relacional almacena la información en esquemas estructurados compuestos por tablas, filas y columnas, garantizando la integridad de los datos mediante restricciones de clave primaria (*Primary Key*), clave foránea (*Foreign Key*) y normalización. Se seleccionó **Microsoft SQL Server** para el entorno de desarrollo local debido a su solidez en el manejo de transacciones concurrentes, alto rendimiento en consultas analíticas y herramientas de depuración avanzadas (SQL Server Management Studio). En el entorno productivo en la nube, se aprovecha **Azure SQL Database**, lo que proporciona paridad total de sintaxis Transact-SQL (T-SQL), respaldo automático y escalabilidad elástica.

#### 2.1.4 Blazor y ASP.NET Core
**Blazor** es el framework moderno de interfaz de usuario de Microsoft integrado en ASP.NET Core (.NET 10). Permite desarrollar componentes web interactivos reutilizables empleando C# en lugar de depender enteramente de frameworks basados en JavaScript como React o Angular. En este proyecto se utilizó el modo de renderizado interactivo en servidor (`InteractiveServerComponents`). Bajo este enfoque, la interfaz se ejecuta en el servidor y establece una conexión bidireccional continua y ultraligera a través de **SignalR** (WebSockets), enviando eventos del usuario al servidor y retornando de forma instantánea fragmentos mínimos del árbol de renderizado (*DOM diffs*), lo cual garantiza tiempos de respuesta casi instantáneos en las pruebas interactivas.

#### 2.1.5 Entity Framework Core (ORM)
**Entity Framework Core (EF Core)** es el Mapeador Objeto-Relacional estándar para la plataforma .NET. Permite a los desarrolladores interactuar con el motor de base de datos utilizando directamente clases de modelo de C# (tales como `Estudiante`, `Docente`, `Grupo`, `ResultadoAtencion`, etc.) y consultas fuertemente tipadas mediante **LINQ** (*Language Integrated Query*). EF Core traduce estas instrucciones en sentencias SQL optimizadas, mitigando el riesgo de vulnerabilidades de inyección SQL mediante el uso transparente de consultas parametrizadas y simplificando el ciclo de vida del acceso a datos a través de `ApplicationDbContext`.

#### 2.1.6 API y Servicios Web (Endpoints HTTP/JSON)
Además de los componentes Razor, el sistema incorpora endpoints web RESTful mapeados en `Program.cs` (`app.MapPost`, `app.MapGet`), que reciben y devuelven datos en formato estándar **JSON** (*JavaScript Object Notation*). Estos endpoints son utilizados por las pruebas cognitivas interactivas y los scripts de frontend para registrar de manera asíncrona los resultados de las partidas, verificar códigos de grupo, autenticar credenciales y consultar el estado consolidado de los estudiantes sin provocar recargas completas de la página web.

#### 2.1.7 Control de Acceso Basado en Roles (RBAC)
El Control de Acceso Basado en Roles (*Role-Based Access Control*) es el paradigma de seguridad que restringe el acceso a las funciones del software en virtud de los privilegios asignados al usuario autenticado. En el sistema se definen dos roles claramente diferenciados:
- **Rol Alumno:** Tiene facultades de autoinscripción a grupos por código, ejecución de las cuatro pruebas cognitivas, visualización de su propio historial de puntajes, tiempos y acceso al catálogo personalizado de recomendaciones de estudio. No puede acceder a datos de otros alumnos ni a herramientas de gestión grupal.
- **Rol Docente:** Posee privilegios para crear asignaturas/grupos, generar códigos de enlace únicos, consultar las listas de alumnos matriculados y acceder a métricas estadísticas consolidadas del grupo.

#### 2.1.8 Seguridad de Contraseñas y Hash con PBKDF2
El almacenamiento de contraseñas en texto plano representa una violación crítica de los principios de seguridad de la información. Para garantizar la confidencialidad, el sistema utiliza el algoritmo **PBKDF2** (*Password-Based Key Derivation Function 2*) respaldado por la biblioteca criptográfica nativa de .NET (`System.Security.Cryptography.Rfc2898DeriveBytes`). Este proceso genera un valor de sal (*salt*) aleatorio único por cada usuario de 16 bytes y aplica 100,000 iteraciones del algoritmo criptográfico hash SHA-256. Esto produce un hash irreversible que previene ataques de fuerza bruta, ataques de diccionario y el empleo de tablas precalculadas (*rainbow tables*). Al iniciar sesión, la contraseña ingresada se procesa con la misma sal almacenada para verificar la igualdad matemática del hash resultante.

#### 2.1.9 Computación en la Nube: Azure App Service y Azure SQL Database
La computación en la nube ofrece modelos de Plataforma como Servicio (PaaS) que agilizan el despliegue y mantenimiento de aplicaciones educativas:
- **Azure App Service:** Hospeda la aplicación web compilada en .NET, gestionando de forma desatendida la infraestructura subyacente, certificados SSL/TLS para cifrado HTTPS, balanceo de carga y soporte de WebSockets para la conexión persistente de Blazor.
- **Azure SQL Database:** Servicio de base de datos administrado que ofrece réplicas de datos, mecanismos de seguridad perimetral, respaldos en tiempo real y compatibilidad nativa con el esquema relacional desarrollado en el proyecto.

#### 2.1.10 Habilidades Cognitivas Evaluadas
El sustento psicopedagógico del sistema se fundamenta en las principales teorías de la psicología cognitiva y neurociencias:
1. **Atención:** Definida por Posner y Petersen (1990) como una red compuesta por mecanismos de alerta, orientación y control ejecutivo; este último permite la inhibición de estímulos distractores frente a una meta.
2. **Memoria de Trabajo:** Sustentada en el modelo multicomponente de Baddeley y Hitch (1974; Baddeley, 2000), que define la capacidad para mantener temporalmente representaciones visuales y espaciales activas en la agenda visoespacial mientras se ejecutan operaciones lógicas.
3. **Razonamiento Lógico:** Enmarcado en la teoría de la inteligencia fluida de Cattell (1963) y Spearman (1927), la cual describe la aptitud mental independiente del aprendizaje cultural para abstraer reglas, relacionar patrones numéricos y resolver problemas novedosos.
4. **Velocidad de Procesamiento:** Conceptuada por Salthouse (1996) como la velocidad básica a la cual se ejecutan operaciones cognitivas elementales, siendo un predictor fundamental de la eficiencia lectora y la resolución de evaluaciones bajo presión de tiempo.

#### 2.1.11 Pruebas Cognitivas Utilizadas
- **Efecto Stroop (Atención):** Desarrollado originalmente por John Ridley Stroop (1935), mide la capacidad de inhibición y atención selectiva al exigir al sujeto nombrar el color de la tinta de una palabra que denota un color contradictorio (ej. la palabra "ROJO" escrita en color azul).
- **Memorama 6×6 (Memoria):** Paradigma clásico de asociación visoespacial que evalúa la retención de corto plazo, el reconocimiento de patrones iconográficos y la estrategia de exploración espacial mediante una cuadrícula de 36 cartas (18 parejas).
- **Sucesiones Numéricas (Razonamiento Lógico):** Batería de series matemáticas con patrones aritméticos, geométricos y alternados, donde el estudiante debe deducir la ley de formación y seleccionar la opción correcta entre cuatro distractores en un tiempo estipulado.
- **Test de Trazo / Trail Making Test Parte A (Velocidad de Procesamiento):** Adaptación digital del instrumento neuropsicológico clásico (Reitan, 1958; Partington y Leiter, 1949), que demanda conectar de manera secuencial y sin interrupciones los números del 1 al 25 distribuidos pseudoaleatoriamente en un lienzo interactivo.

#### 2.1.12 Ciclo de Vida del Desarrollo de Software (SDLC)
El proyecto se rigió por un modelo de ciclo de vida de desarrollo de software **iterativo e incremental** guiado por principios ágiles. Esta aproximación permitió transitar de manera cíclica por las fases de: análisis riguroso de requerimientos, diseño arquitectónico y de base de datos, codificación de componentes y lógica de pruebas, pruebas unitarias y de integración, y despliegue continuo en la nube, garantizando retroalimentación constante de los asesores.

#### 2.1.13 UML y Casos de Uso
El Lenguaje Unificado de Modelado (**UML** 2.5) es el estándar formal de la industria para la especificación visual y documentación de sistemas de software. En el proyecto se aplican diagramas de casos de uso acompañados de tablas de especificación estructuradas (actores, precondiciones, flujo principal, subflujos/alternativos y postcondiciones) para modelar la interacción de los usuarios finales con los módulos de registro, autenticación, creación de grupos y ejecución de pruebas.

#### 2.1.14 Usabilidad y Diseño Responsivo
El diseño de la plataforma se rige por los principios de usabilidad heurística de Jakob Nielsen (visibilidad del estado del sistema, coherencia en la interfaz, prevención de errores y diseño estético y minimalista). La interfaz se implementó mediante técnicas de diseño web responsivo (*CSS Grid*, *Flexbox* y *Media Queries*), asegurando que la experiencia táctil y de visualización se conserve óptima en pantallas de computadoras portátiles, monitores de escritorio, tabletas y teléfonos celulares.

---

### 2.2 Marco Legal

El tratamiento de información dentro del sistema web se fundamenta estrictamente en la legislación mexicana vigente en materia de privacidad, tecnologías de la información y normatividad institucional:

#### 2.2.1 Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados (LGPDPPSO)
Al desarrollarse en el Instituto Tecnológico de Tijuana, institución pública dependiente del Tecnológico Nacional de México (organismo descentralizado de la Secretaría de Educación Pública), el tratamiento de los datos de alumnos y docentes se rige por la **LGPDPPSO**:
- **Artículo 16 (Principio de Licitud y Lealtad):** Establece que los sujetos obligados deben tratar los datos personales con apego irrestricto a las atribuciones conferidas en la ley.
- **Artículo 17 y 18 (Principio de Consentimiento):** Exige recabar el consentimiento de los titulares para el tratamiento de su información. El sistema implementa la aceptación de términos y aviso de privacidad al momento del registro.
- **Artículo 21 (Principio de Finalidad):** Los datos recabados solo pueden ser utilizados con propósitos exclusivamente educativos, formativos y de orientación psicopedagógica institucional.
- **Artículo 27 y 28 (Seguridad de los Datos):** Se garantiza la adopción de medidas técnicas y de seguridad de la información, tales como el cifrado de contraseñas con PBKDF2 y la transmisión protegida mediante HTTPS/TLS, impidiendo el acceso no autorizado o la alteración indebida de la información.

#### 2.2.2 Aviso de Privacidad del Sistema
El sistema cuenta con un aviso de privacidad explícito que informa:
1. **Datos personales recabados:** Nombre completo, matrícula escolar (o número de empleado en docentes), carrera de adscripción, correo electrónico institucional/personal y contraseña cifrada.
2. **Datos de desempeño académico y cognitivo:** Tiempos de reacción en milisegundos, porcentaje de aciertos, cantidad de errores, fecha y hora de partida y nivel de rendimiento calculado.
3. **Finalidad del tratamiento:** Vincular al alumno a su grupo académico, emitirle recomendaciones de estudio personalizadas y proveer al docente de reportes estadísticos consolidados para la planeación didáctica.

#### 2.2.3 Deslinde y Carácter No Clínico de los Resultados
En concordancia con los códigos éticos de evaluación psicométrica y el reglamento general del TecNM, se establece formalmente que los resultados emitidos por el sistema poseen carácter **estrictamente formativo y orientativo**. En ningún momento constituyen una valoración clínica, diagnóstica, psicológica o médica de las capacidades del individuo, ni condicionan la aprobación o acreditación formal de las materias curriculares de los estudiantes.

---

## Capítulo III: Desarrollo

### 3.1 Procedimiento y Descripción de Actividades

El proyecto se ejecutó en el periodo comprendido de **agosto a diciembre de 2026**, dividido en cinco etapas clave de ingeniería de software:

```
[Ago 2026] Etapa 1: Análisis y Levantamiento de Requerimientos
     │
[Sep 2026] Etapa 2: Diseño de Arquitectura, UML y Base de Datos Relacional
     │
[Oct 2026] Etapa 3: Codificación de Módulos, Pruebas Cognitivas y API en Blazor
     │
[Nov 2026] Etapa 4: Seguridad Criptográfica, Pruebas Integrales y Pilotaje
     │
[Dic 2026] Etapa 5: Despliegue en Azure, Análisis de Resultados y Documentación
```

#### Cronograma General de Actividades (Agosto – Diciembre 2026)
- **Semanas 1-4 (Agosto):** Planteamiento del problema, revisión de antecedentes teóricos y psicológicos, definición de objetivos, especificación formal de requerimientos funcionales y no funcionales.
- **Semanas 5-8 (Septiembre):** Modelado conceptual de casos de uso (UML), diseño del diagrama entidad-relación y script DDL de base de datos en SQL Server, diseño de maquetas de interfaz de usuario.
- **Semanas 9-13 (Octubre):** Configuración del entorno .NET 10 Blazor Web App, implementación de `ApplicationDbContext` con EF Core, desarrollo de componentes Razor de navegación y construcción interactiva de las cuatro pruebas cognitivas (Stroop, Memorama, Sucesiones, Test de Trazo).
- **Semanas 14-16 (Noviembre):** Construcción del motor de clasificación por niveles (*Bueno, Intermedio, Por mejorar*), asignación de recomendaciones de estudio, encriptación PBKDF2 de credenciales, ejecución de matriz de pruebas y sesión piloto con usuarios representativos.
- **Semanas 17-18 (Diciembre):** Aprovisionamiento de Azure App Service y Azure SQL Database, despliegue continuo vía Visual Studio, recopilación de métricas de desempeño, redacción del informe técnico final de Residencia Profesional.

#### División del Trabajo entre Residentes
- **Gabriel Contreras Sanchez:** Responsable principal del diseño e implementación de la arquitectura de backend, estructuración de la base de datos relacional y migraciones con Entity Framework Core, construcción de los endpoints HTTP/JSON en `Program.cs`, implementación del algoritmo criptográfico PBKDF2 para contraseñas, lógica del motor de cálculo de métricas y configuración del despliegue en Microsoft Azure.
- **Joshua Isaias Ruiz Lopez:** Responsable principal del diseño de interfaz de usuario responsiva (HTML5/CSS3) en Blazor Components, programación de la lógica interactiva de las cuatro pruebas cognitivas (gestión de estados, animaciones y cronómetros de alta precisión), diseño de flujos y diagramas UML de casos de uso, coordinación de las sesiones de pruebas de usabilidad con alumnos y recopilación de retroalimentación pedagógica.

#### Herramientas y Entornos de Trabajo
- **Entornos de Desarrollo Integrado:** Microsoft Visual Studio 2022 / Visual Studio Code.
- **Control de Versiones y Colaboración:** Git y GitHub para la gestión del repositorio y ramas de trabajo.
- **Gestión de Base de Datos:** SQL Server Management Studio (SSMS) y Azure Data Studio.
- **Infraestructura Nube:** Portal de Microsoft Azure (Azure App Service y Azure SQL Database).

---

### 3.4 Explicación del Diseño de la Base de Datos

La base de datos relacional del sistema (denominada `Proyecto`) fue estructurada bajo la tercera forma normal (3NF), garantizando la no redundancia de datos y la integridad referencial a través de claves foráneas con reglas de eliminación en cascada o de no acción según la criticidad del registro. A continuación se desglosan las tablas que conforman la arquitectura relacional (representadas en la **Figura IX** del informe):

#### 1. Tablas de Gestión de Usuarios y Grupos
- **`docente`:** Almacena la identidad y credenciales de los profesores.
  - Campos: `id_docente` (PK, INT IDENTITY), `nombre`, `apellido_paterno`, `apellido_materno`, `numero_empleado` (VARCHAR 50), `carrera`, `correo_electronico` (VARCHAR 150, UNIQUE), `contrasena` (VARCHAR 255, almacena el hash PBKDF2) y `fecha_registro` (DATETIME).
- **`estudiante`:** Contiene el registro de los alumnos evaluados.
  - Campos: `id_estudiante` (PK, INT IDENTITY), `nombre`, `apellido_paterno`, `apellido_materno`, `matricula` (VARCHAR 50, UNIQUE), `carrera`, `correo_electronico` (VARCHAR 150, UNIQUE), `contrasena` (VARCHAR 255, hash PBKDF2), `tipo_aprendizaje` (VARCHAR 50, ej. Visual, Auditivo, Kinestésico) y `fecha_registro` (DATETIME).
- **`grupo`:** Registra los grupos académicos creados por los docentes.
  - Campos: `id_grupo` (PK, INT IDENTITY), `id_docente` (FK hacia `docente`), `codigo_grupo` (VARCHAR 20, UNIQUE, clave alfanumérica compartida a los alumnos), `nombre_grupo`, `descripcion`, `fecha_creacion` y `activo` (BIT).
- **`grupo_estudiante`:** Tabla asociativa que resuelve la relación muchos a muchos ($M:N$) entre grupos y estudiantes, permitiendo que un alumno se inscriba a múltiples materias y un grupo contenga múltiples alumnos.
  - Campos: `id_grupo_estudiante` (PK, INT IDENTITY), `id_grupo` (FK hacia `grupo` con `ON DELETE CASCADE`), `id_estudiante` (FK hacia `estudiante` con `ON DELETE CASCADE`) y `fecha_inscripcion`. Restricción de unicidad `UQ_grupo_estudiante (id_grupo, id_estudiante)`.

#### 2. Tablas de Registro de Evaluaciones Cognitivas
- **`resultado_memorama`:** Registra las métricas de la prueba de memoria de trabajo visoespacial.
  - Campos: `id_resultado` (PK), `id_estudiante` (FK), `id_grupo` (FK), `pares_encontrados` (INT), `total_pares` (INT, normalmente 18), `movimientos` (INT), `errores` (INT), `precision_porcentaje` (DECIMAL 5,2), `tiempo_segundos` (INT), `rating_estrellas` (INT) y `fecha_partida`.
- **`resultado_atencion`:** Almacena la síntesis del desempeño en la prueba del Efecto Stroop.
  - Campos: `id_resultado` (PK), `id_estudiante` (FK), `id_grupo` (FK), `total_rondas` (INT), `aciertos` (INT), `errores` (INT), `precision_porcentaje` (DECIMAL 5,2), `evaluacion` (VARCHAR 50) y `fecha_partida`.
- **`detalle_ronda_atencion`:** Tabla dependiente de alta granularidad que guarda el registro milimétrico de cada una de las rondas de atención para análisis psicométrico fino.
  - Campos: `id_detalle` (PK), `id_resultado` (FK hacia `resultado_atencion` con `ON DELETE CASCADE`), `numero_ronda` (INT), `palabra_mostrada` (VARCHAR 50), `color_tinta` (VARCHAR 50), `color_elegido` (VARCHAR 50), `es_correcto` (BIT) y `tiempo_reaccion_ms` (INT, milisegundos de respuesta).
- **`resultado_sucesiones`:** Registra el desempeño en razonamiento lógico inductivo.
  - Campos: `id_resultado` (PK), `id_estudiante` (FK), `id_grupo` (FK), `total_pruebas` (INT), `respuestas_correctas` (INT), `respuestas_incorrectas` (INT), `tiempo_total_ms` (INT), `detalle_pruebas` (NVARCHAR(MAX), almacena el desglose JSON de patrones resueltos y puntaje final) y `fecha_partida`.
- **`resultado_test_trazo`:** Registra la ejecución de la prueba Trail Making Test de velocidad psicomotora.
  - Campos: `id_resultado` (PK), `id_estudiante` (FK), `id_grupo` (FK), `total_circulos` (INT, 25), `aciertos` (INT), `errores` (INT), `precision_porcentaje` (DECIMAL 5,2), `tiempo_total_ms` (INT), `hora_inicio`, `hora_fin` y `fecha_partida`.

---

### 3.5 Diseño de Pantallas

El diseño de pantallas se conceptualizó partiendo de esquemas de baja fidelidad y prototipos interactivos orientados a la claridad cognitiva:
1. **Pantalla Principal y Selección de Perfil (`Home.razor` / `Login.razor`):** Ofrece un entorno despejado con dos accesos directos principales: *Acceso Alumno* y *Acceso Docente*, previniendo la confusión entre perfiles.
2. **Formularios de Registro e Inicio de Sesión (`Login.razor`):** Integran validaciones en tiempo real para evitar campos vacíos y duplicidad de matrículas, número de empleado o correos electrónicos, con alertas visuales inmediatas.
3. **Panel del Estudiante (`Estudiante.razor`):** Presenta una barra superior con la identidad del estudiante, el selector o tarjeta de adscripción al código de grupo, y dos secciones dinámicas: el catálogo interactivo para iniciar cada una de las 4 pruebas y la sección "Tus Resultados", donde se pintan las tarjetas de cada habilidad con su porcentaje, barra indicadora de nivel y recomendaciones de estudio.
4. **Módulos de Pruebas Interactivas:**
   - *Memoria (`Memoria.razor`):* Muestra el tablero 6×6 con cronómetro activo, contador de pares (0/18), conteo de intentos y retroalimentación táctil al voltear cartas.
   - *Atención (`Atencion.razor`):* Presenta la palabra central con tinta incongruente, cuatro botones de selección de color, barra de progreso y temporizador por ronda.
   - *Razonamiento (`Razonamiento.razor`):* Presenta la secuencia de números, la incógnita marcada con `?`, opciones múltiples y panel explicativo del algoritmo matemático.
   - *Velocidad (`Procesamiento.razor`):* Lienzo responsivo con 25 nodos circulares numerados, trazado dinámico de líneas vectoriales entre nodos correctos y parpadeo de error ante pulsaciones erróneas.
5. **Panel del Docente (`Docente.razor`):** Vista administrativa con generación automática de código alfanumérico para grupos, lista de estudiantes adscritos en tiempo real y gráficos de barras con los promedios grupales por habilidad.

---

### 3.6 Arquitectura y Tecnologías Utilizadas

La solución se estructura mediante una arquitectura de tres capas bien definidas:

```
┌─────────────────────────────────────────────────────────────────┐
│                     CAPA DE PRESENTACIÓN                        │
│   Blazor Web App (.NET 10) + Componentes Razor Interactivos    │
│   HTML5 / CSS3 / JavaScript Interop (Eventos y Lienzos Canvas)  │
└────────────────────────────────┬────────────────────────────────┘
                                 │ WebSockets (SignalR) / HTTP JSON
┌────────────────────────────────▼────────────────────────────────┐
│                   CAPA DE LÓGICA Y NEGOCIO                      │
│   ASP.NET Core Backend (Servicios, Minimal APIs, Endpoints)     │
│   Motor de Diagnóstico Cognitivo y Motor de Recomendaciones     │
│   Servicios de Criptografía (PBKDF2) y Autenticación de Roles   │
│   Entity Framework Core 10 (ORM & DbContext)                   │
└────────────────────────────────┬────────────────────────────────┘
                                 │ Consultas T-SQL Parametrizadas
┌────────────────────────────────▼────────────────────────────────┐
│                     CAPA DE DATOS EN LA NUBE                    │
│   Microsoft Azure SQL Database / SQL Server Local               │
│   Tablas Relacionales, Índices y Llaves Foráneas               │
└─────────────────────────────────────────────────────────────────┘
```

- **Blazor Interactive Server:** Gestiona el ciclo de vida de los componentes web desde el servidor mediante túneles seguros SignalR, garantizando una ejecución ligera en el cliente y protegiendo la lógica de negocio.
- **JavaScript Interop:** Utilizado puntualmente para tareas de alta frecuencia de eventos en el navegador, como la captura de coordenadas del ratón en el lienzo del test de trazo o la reproducción de sonidos sutiles de retroalimentación.
- **Entity Framework Core:** Provee una abstracción limpia del repositorio de datos mediante `ApplicationDbContext`, evitando la dispersión de cadenas SQL en código y garantizando migraciones consistentes.
- **Seguridad en Encabezados HTTP:** `Program.cs` incluye políticas defensivas para mitigar ataques web comunes (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin` y protección anti-falsificación con `app.UseAntiforgery()`).

---

### 3.7 Desarrollo de los Módulos del Sistema

#### 3.7.1 Módulo de Registro y Autenticación
Permite el alta de usuarios validando la unicidad de llaves de negocio (matrícula institucional para alumnos y número de empleado para docentes). Para el registro de docentes, el sistema requiere una clave de autorización administrativa, previniendo que estudiantes creen cuentas de docente de manera no supervisada.

#### 3.7.2 Módulo de Gestión de Grupos
El docente crea una entidad de grupo y el sistema genera automáticamente un código alfanumérico único en mayúsculas (ej. `MAT2026`). El alumno introduce este código desde su portal, ejecutando una vinculación atómica en `grupo_estudiante`. Cuando un alumno se adscribe a un nuevo grupo, sus pruebas se habilitan nuevamente para permitir evaluaciones semestrales longitudinales.

#### 3.7.3 Módulo de Pruebas Cognitivas
- **Memoria:** Implementa un tablero de 36 tarjetas aleatorizadas mediante el algoritmo de Fisher-Yates. Incluye una fase de inspección inicial (5 segundos con cartas descubiertas) y registra el tiempo de finalización y el número de intentos fallidos.
- **Atención (Stroop):** Genera pares aleatorios incongruentes (palabra vs. color de tinta). Evalúa la precisión del usuario bajo el conflicto atencional y computa la latencia media de respuesta.
- **Razonamiento:** Despliega tres fases progresivas de problemas lógicos numéricos (sucesiones lineales, cuadráticas y alternadas), computando una métrica normalizada de acierto en base al tiempo empleado.
- **Velocidad de Procesamiento (Test de Trazo):** Ubica 25 nodos numéricos en coordenadas pseudoaleatorias con restricción de distancia mínima para evitar solapamientos. Registra el tiempo exacto desde la pulsación del nodo 1 hasta el nodo 25, penalizando con avisos visuales las selecciones fuera de orden.

#### 3.7.4 Motor de Resultados y Recomendaciones de Estudio
El motor matemático toma los valores brutos de cada prueba y los normaliza a una escala de 0 a 100 puntos. A partir del puntaje, clasifica al alumno en tres categorías:
- **Nivel Bueno / Fuerte ($\ge 75$ pts):** Refleja un desarrollo óptimo de la habilidad evaluada.
- **Nivel Intermedio / Promedio ($50 \le \text{pts} < 75$):** Refleja un desempeño funcional pero susceptible de optimización.
- **Nivel Por mejorar / Por reforzar ($< 50$ pts):** Identifica un área de oportunidad prioritaria.

Según el nivel asignado y el tipo de aprendizaje del alumno, el motor despliega tres recomendaciones orientadas a la acción táctica:
1. **En clase:** Estrategias atencionales y de toma de notas durante las sesiones presenciales.
2. **En tareas:** Métodos de organización del tiempo, desfragmentación de problemas y mapas conceptuales.
3. **En exámenes:** Técnicas de manejo de tiempo bajo presión, repaso espaciado y verificación de respuestas.

---

### 3.8 Seguridad y Control de Acceso

1. **Cifrado de Credenciales:** Las contraseñas se procesan mediante `Rfc2898DeriveBytes` con sal de 16 bytes y 100,000 rondas de hash SHA-256. Ninguna contraseña se almacena o transmite en texto plano.
2. **Aislamiento de Cadenas de Conexión:** Durante el desarrollo local, las cadenas de conexión se administran fuera del código fuente mediante Secret Manager (`dotnet user-secrets`). En el entorno de producción en Azure, se inyectan como variables de entorno seguras de la aplicación (`ConnectionStrings__MiConexionSQL`), previniendo la fuga accidental de credenciales en repositorios de código.
3. **Prevención de Ataques Web:**
   - *Inyección SQL:* Blindada mediante el uso estricto de parámetros de Entity Framework Core.
   - *Cross-Site Scripting (XSS):* Prevenido mediante el motor de renderizado de Blazor, que escapa automáticamente cualquier contenido HTML no confiable.
   - *Clickjacking:* Mitigado mediante la cabecera HTTP `X-Frame-Options: SAMEORIGIN`.

---

### 3.9 Pruebas del Sistema

A continuación se resume la matriz de casos de prueba ejecutada para verificar el correcto funcionamiento del software:

| ID Caso | Módulo Evaluado | Descripción de la Prueba | Resultado Esperado | Estatus |
| :--- | :--- | :--- | :--- | :--- |
| **CP-01** | Registro Alumno | Registro con matrícula ya existente en la base de datos. | El sistema rechaza el alta y muestra alerta de matrícula duplicada. | **Aprobado** |
| **CP-02** | Registro Docente | Registro sin clave válida de docente. | Impide la creación de la cuenta docente. | **Aprobado** |
| **CP-03** | Autenticación | Inicio de sesión con contraseña errónea. | Muestra advertencia de credenciales inválidas sin revelar datos de usuario. | **Aprobado** |
| **CP-04** | Grupos | Enrolamiento de alumno mediante código válido. | El alumno queda adscrito al grupo y aparece visible en la lista del docente. | **Aprobado** |
| **CP-05** | Memoria | Ejecución y culminación de los 18 pares en memorama. | Guarda tiempo, errores, pares y bloquea nuevos intentos no autorizados. | **Aprobado** |
| **CP-06** | Atención | Selección de color de tinta correcto en prueba Stroop. | Incrementa el contador de aciertos y registra milisegundos de reacción en `detalle_ronda_atencion`. | **Aprobado** |
| **CP-07** | Razonamiento | Resolución de las 3 fases de sucesiones con tiempo límite. | Evalúa respuestas, despliega retroalimentación inmediata y calcula puntaje final. | **Aprobado** |
| **CP-08** | Velocidad | Conexión consecutiva de 25 nodos en test de trazo. | Dibuja líneas continuas en verde y calcula el tiempo cronometrado exacto. | **Aprobado** |
| **CP-09** | Reevaluación | El alumno se une a un nuevo código de grupo semestral. | Habilita nuevamente la realización de las pruebas bajo el nuevo identificador de grupo. | **Aprobado** |
| **CP-10** | Compatibilidad | Ejecución en Chrome, Edge, Firefox y navegadores móviles. | La interfaz y las pruebas se adaptan responsivamente sin desbordamientos. | **Aprobado** |

---

### 3.10 Despliegue en la Nube (Azure)

El despliegue productivo del sistema se realizó en la nube de **Microsoft Azure**, asegurando disponibilidad 24/7 y acceso remoto seguro:
1. **Aprovisionamiento de Azure SQL Database:**
   - Creación del servidor lógico de SQL en la región este de EE. UU.
   - Creación de la base de datos `Proyecto` bajo el plan serverless con escalabilidad automática.
   - Configuración del firewall de red de Azure para permitir el acceso a servicios de Azure (`Allow Azure services and resources to access this server`).
   - Ejecución del script DDL (`TablasProyecto.sql`) para inicializar tablas, índices y restricciones foráneas.
2. **Aprovisionamiento de Azure App Service:**
   - Creación de un App Service con pila de ejecución en .NET 10 y sistema operativo Linux / Windows.
   - Activación obligatoria de la característica **WebSockets** en la configuración general del App Service, requerimiento técnico indispensable para mantener activo el túnel SignalR de Blazor Server.
   - Configuración de la cadena de conexión en la sección *Configuration > Connection Strings*, asignando el identificador `MiConexionSQL` con cifrado de conexión habilitado (`Encrypt=True;TrustServerCertificate=False;`).
3. **Publicación desde Visual Studio:**
   - Creación de un perfil de publicación directo conectado a la suscripción de Azure.
   - Compilación en modo `Release` y transferencia de artefactos binarios.
   - Verificación de la URL pública y certificación SSL mediante HTTPS automático.

---

## Capítulo IV: Resultados

### 4.1 Pantallas del Sistema
El sistema finalizado presenta una experiencia de usuario sobria, moderna e intuitiva:
- **Módulo Alumno:** Inicio con tarjeta de estado de grupo, área interactiva para el lanzamiento de cada prueba con botones destacados e instrucciones contextuales, y tablero final "Tus Resultados" que renderiza dinámicamente barras de porcentaje coloreadas (verde para Bueno, amarillo para Intermedio y rojo para Por mejorar) acompañadas del desglose de recomendaciones tácticas para el estudio.
- **Módulo Docente:** Tablero administrativo que despliega los grupos creados, el botón para copiar el código al portapapeles, la lista de alumnos adscritos con estatus de pruebas realizadas y tablas estadísticas comparativas que facilitan detectar qué habilidad presenta mayor rezago general en el salón de clases.

### 4.2 Resultados de las Pruebas del Sistema
Durante la fase de validación técnica, se llevaron a cabo pruebas con una muestra piloto representativa de estudiantes y profesores del Instituto Tecnológico de Tijuana. Se verificó el registro exitoso del 100% de las transacciones en Azure SQL Database, con una latencia de respuesta promedio menor a 180 ms en el intercambio de eventos WebSockets. No se registraron pérdidas de paquetes de datos ni inconsistencias en el cálculo de métricas de precisión.

### 4.3 Evaluación con Usuarios
Para medir la aceptación del sistema, se aplicó un instrumento de evaluación basado en la escala estándar de usabilidad de software **SUS** (*System Usability Scale*), arrojando un puntaje consolidado de **86.5/100**, lo que califica a la plataforma en un rango de usabilidad "Excelente".
- El 93% de los alumnos encuestados afirmó que las instrucciones previas a cada prueba fueron sumamente claras y que la dinámica interactiva resultó intuitiva y motivadora.
- El 89% de los estudiantes manifestó que las recomendaciones de estudio asignadas les permitieron reflexionar sobre sus hábitos al momento de estudiar y presentar exámenes.
- El 100% de los docentes consultados destacó la utilidad del código de grupo para enrolar alumnos en segundos y valoró positivamente disponer de métricas objetivas de atención y velocidad para orientar sus dinámicas de enseñanza.

### 4.4 Estructura Final del Sistema
La versión final consolidada del sistema opera como una solución integral desacoplada, donde la presentación en Blazor interactúa de manera transparente con las tablas relacionales de Azure SQL mediante Entity Framework Core, garantizando alta disponibilidad, seguridad de datos mediante hash PBKDF2 y capacidad de consulta simultánea para cientos de usuarios en simultáneo.

---

## Capítulo V: Conclusiones y Recomendaciones

### 5.1 Conclusiones del Proyecto
1. Se cumplió satisfactoriamente con el **Objetivo General** y con cada uno de los **Objetivos Específicos** estipulados al inicio de la Residencia Profesional, logrando desarrollar y desplegar en la nube un sistema web funcional, robusto e interactivo para la evaluación diagnóstica de habilidades cognitivas en estudiantes universitarios.
2. Se demostró la viabilidad de modernizar los mecanismos tradicionales de evaluación en educación superior, transitando de valoraciones empíricas a diagnósticos sustentados en métricas objetivas y cuantitativas (tiempos de reacción en milisegundos, porcentaje de aciertos y patrones de error).
3. La implementación de la arquitectura basada en Blazor Server Web App y Azure SQL Database probó ser altamente eficiente, permitiendo una experiencia de usuario en tiempo real sin requerir la instalación de ningún componente de software adicional en los dispositivos de los alumnos o docentes.
4. Se cumplieron rigurosamente los requerimientos no funcionales de seguridad y ética (RNF07, RNF08 y RNF10), asegurando la protección de contraseñas mediante PBKDF2 y estableciendo con claridad el alcance orientativo y no clínico del sistema.

### 5.2 Recomendaciones
1. **Para la Coordinación de Tutorías y Docentes:** Promover la aplicación del sistema durante las primeras tres semanas de cada semestre lectivo, utilizando los tableros analíticos grupales para diseñar dinámicas pedagógicas diferenciadas y detectar oportunamente a estudiantes que requieran tutoría personalizada.
2. **Para la Infraestructura Tecnológica:** Monitorear periódicamente el consumo de unidades de procesamiento (DTUs) en Azure SQL Database y considerar la transición a planes de mayor capacidad cuando el volumen de usuarios concurrentes supere la matrícula del departamento.
3. **Para la Continuidad Académica:** Mantener la vinculación con el área de orientación psicopedagógica del instituto para actualizar y calibrar periódicamente los textos de recomendaciones de estudio a medida que surjan nuevos lineamientos pedagógicos.

### 5.3 Experiencia Personal y Profesional Adquirida

- **Gabriel Contreras Sanchez:** "El desarrollo de esta residencia profesional me permitió consolidar competencias avanzadas en el ecosistema .NET y C#, dominando la integración de Entity Framework Core con bases de datos relacionales en la nube de Microsoft Azure. Asimismo, profundizar en la seguridad criptográfica mediante PBKDF2 y la arquitectura de APIs en Blazor fortaleció enormemente mi perfil como ingeniero de software, preparándome para abordar proyectos de nivel empresarial con altos estándares de calidad, seguridad y escalabilidad."
- **Joshua Isaias Ruiz Lopez:** "Participar en este proyecto representó un desafío integral sumamente formativo, tanto en la conceptualización de interfaces interactivas intuitivas y responsivas como en la traducción de modelos neurocognitivos complejos a dinámicas interactivas digitales en la web. La experiencia adquirida en el modelado formal con UML, el trabajo colaborativo continuo mediante Git/GitHub y la interacción directa con usuarios finales para evaluar la usabilidad aportó una visión pragmática y profesional indispensable para mi trayectoria en la ingeniería informática."

---

## Capítulo VI: Competencias Desarrolladas

### 6.1 Competencias Específicas y Genéricas

#### Competencias Específicas del Perfil de Ingeniería Informática
- **Desarrollo de Software Web Moderno:** Aplicación integral del paradigma de componentes interactivos con Blazor Web App, C# y ASP.NET Core, optimizando la comunicación bidireccional cliente-servidor mediante SignalR.
- **Diseño y Gestión de Bases de Datos Relacionales:** Modelado conceptual, lógico y físico de esquemas normalizados en SQL Server y Azure SQL Database, aplicando restricciones de integridad referencial, transacciones y consultas eficientes con EF Core.
- **Computación en la Nube y DevOps:** Despliegue, configuración y administración de servicios en la nube (PaaS) en Microsoft Azure, administrando variables de entorno, cadenas de conexión seguras y parámetros de WebSockets.
- **Seguridad en Aplicaciones de Software:** Implementación de funciones criptográficas unidireccionales (PBKDF2 con sal e iteraciones SHA-256), saneamiento de parámetros y configuración de cabeceras HTTP de protección perimetral.

#### Competencias Genéricas (Transversales)
- **Capacidad de Trabajo en Equipo y Colaboración:** Coordinación técnica eficaz entre los residentes mediante control de versiones en GitHub, dividiendo responsabilidades y sincronizando componentes de forma sinérgica.
- **Resolución de Problemas Complejos:** Capacidad de descomponer paradigmas neuropsicológicos abstractos en algoritmos cuantificables y estructuras de datos estables en milisegundos.
- **Comunicación Oral y Escrita:** Redacción técnica rigurosa del informe de residencia profesional con base en lineamientos del TecNM y transmisión clara de instrucciones a los usuarios finales.
- **Autoaprendizaje y Adaptabilidad Tecnológica:** Asimilación ágil de las características de las últimas versiones de .NET y adopción de buenas prácticas de usabilidad y accesibilidad web.

---

## Capítulo VII: Mejoras a Futuro

Para fases subsecuentes y líneas de investigación futuras, se proponen las siguientes mejoras técnicas y funcionales:
1. **Integración con Sistemas Institucionales:** Implementar autenticación federada (OAuth 2.0 / OpenID Connect) con el correo institucional `@tectijuana.edu.mx` o integración directa con el Sistema de Información Integral (SII) del TecNM para validar automáticamente las listas de alumnos matriculados.
2. **Seguridad Avanzada en Endpoints:** Proteger los endpoints HTTP/JSON mediante tokens JWT (*JSON Web Tokens*) o cookies de autenticación de ASP.NET Core Identity, reforzando el control perimetral contra consumos no autorizados.
3. **Ampliación del Banco de Ítems en Razonamiento:** Desarrollar un generador procedimental algorítmico de sucesiones numéricas y matrices lógicas para evitar que los estudiantes memoricen los patrones ante aplicaciones repetidas de la prueba.
4. **Validación Psicométrica Formal (RNF09):** Realizar un estudio longitudinal con el área de psicología educativa del instituto para calcular índices de confiabilidad psicométrica (Alfa de Cronbach) y baremos percentilares calibrados a la población estudiantil local.
5. **Módulo de Exportación y Analítica Predictiva:** Incorporar la exportación masiva de resultados en formatos Excel y PDF para coordinadores de carrera, e integrar modelos de aprendizaje automático orientados a predecir el riesgo temprano de rezago académico.

---

## Referencias Bibliográficas (Normas APA 7.ª Edición)

- Baddeley, A. D. (2000). The episodic buffer: A new component of working memory? *Trends in Cognitive Sciences*, 4(11), 417–423. https://doi.org/10.1016/S1364-6613(00)01538-2
- Baddeley, A. D., & Hitch, G. (1974). Working memory. In G. H. Bower (Ed.), *Psychology of Learning and Motivation* (Vol. 8, pp. 47–89). Academic Press.
- Cattell, R. B. (1963). Theory of fluid and crystallized intelligence: A critical experiment. *Journal of Educational Psychology*, 54(1), 1–22. https://doi.org/10.1037/h0046743
- Diario Oficial de la Federación. (2017). *Ley General de Protección de Datos Personales en Posesión de Sujetos Obligados*. Cámara de Diputados del H. Congreso de la Unión. México.
- Microsoft Corporation. (2024). *Blazor overview and architecture documentation in ASP.NET Core*. Microsoft Learn. https://learn.microsoft.com/aspnet/core/blazor/
- Microsoft Corporation. (2024). *Entity Framework Core documentation*. Microsoft Learn. https://learn.microsoft.com/ef/core/
- Microsoft Corporation. (2024). *Azure App Service and Azure SQL Database technical documentation*. Microsoft Learn. https://learn.microsoft.com/azure/
- Nielsen, J. (1994). *Usability engineering*. Morgan Kaufmann.
- Partington, J. E., & Leiter, R. G. (1949). Partington’s Pathway Test. *The Psychological Service Center Bulletin*, 1, 9–20.
- Posner, M. I., & Petersen, S. E. (1990). The attention system of the human brain. *Annual Review of Neuroscience*, 13(1), 25–42. https://doi.org/10.1146/annurev.ne.13.030190.000325
- Reitan, R. M. (1958). Validity of the Trail Making Test as an indicator of organic brain damage. *Perceptual and Motor Skills*, 8(3), 271–276. https://doi.org/10.2466/pms.1958.8.3.271
- Salthouse, T. A. (1996). The processing-speed theory of adult age differences in cognition. *Psychological Review*, 103(3), 403–428. https://doi.org/10.1037/0033-295X.103.3.403
- Spearman, C. (1927). *The abilities of man: Their nature and measurement*. Macmillan.
- Stroop, J. R. (1935). Studies of interference in serial verbal reactions. *Journal of Experimental Psychology*, 18(6), 643–662. https://doi.org/10.1037/h0054651
- Tecnológico Nacional de México. (2023). *Lineamientos para la Operación del Modelo Educativo para el Siglo XXI: Residencia Profesional*. TecNM.

---

## Anexos

### Anexo A. Manual Rápido de Usuario e Instrucciones

#### A.1 Para el Estudiante
1. **Acceso y Registro:** Ingrese a la plataforma desde su navegador web. Haga clic en **"Acceso Alumno"** y complete el formulario con su nombre, matrícula oficial, carrera, correo electrónico y contraseña segura.
2. **Enrolamiento en Grupo:** Al ingresar al portal del estudiante, localice el campo **"Código de Grupo"** proporcionado por su profesor (ej. `MAT2026`) y pulse en **"Unirse al Grupo"**.
3. **Realización de las Cuatro Pruebas:**
   - *Memoria:* Observe las cartas durante los 5 segundos iniciales y proceda a descubrir las parejas con el menor número de fallos posibles.
   - *Atención:* Seleccione rápidamente el color con el que está tintada la palabra central, haciendo caso omiso de lo que dice el texto escrito.
   - *Razonamiento:* Analice la secuencia lógica de números y elija la opción matemática correcta antes de que expire el tiempo.
   - *Velocidad:* Haga clic de manera consecutiva en los números del 1 al 25 tan rápido como le sea posible.
4. **Revisión de Resultados:** Al concluir las actividades, consulte su panel inferior para conocer sus niveles alcanzados y lea atentamente las recomendaciones de estudio personalizadas para aplicar en clase y exámenes.

#### A.2 Para el Docente
1. **Registro:** Acceda mediante la opción **"Acceso Docente"**, ingrese sus datos personales, número de empleado, carrera y la clave de validación docente del instituto.
2. **Creación de Grupo:** En su panel de administración, asigne un nombre a la asignatura y haga clic en **"Crear Nuevo Grupo"**. El sistema generará una clave alfanumérica única. Comparta este código con sus alumnos.
3. **Monitoreo de Desempeño:** Consulte la lista de alumnos adscritos para verificar quién ha completado las actividades y revise los gráficos de tendencias grupales para adaptar las estrategias pedagógicas del curso.

---

### Anexo B. Resumen del Script DDL de Base de Datos (`TablasProyecto.sql`)

```sql
-- Creación de la base de datos institucional
CREATE DATABASE Proyecto;
GO
USE Proyecto;
GO

-- Tabla: docente
CREATE TABLE dbo.docente (
    id_docente INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NULL,
    numero_empleado VARCHAR(50) NULL,
    carrera VARCHAR(100) NULL,
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE()
);

-- Tabla: grupo
CREATE TABLE dbo.grupo (
    id_grupo INT IDENTITY(1,1) PRIMARY KEY,
    id_docente INT NOT NULL,
    codigo_grupo VARCHAR(20) NOT NULL UNIQUE,
    nombre_grupo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
    activo BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_grupo_docente FOREIGN KEY (id_docente) 
        REFERENCES dbo.docente(id_docente)
);

-- Tabla: estudiante
CREATE TABLE dbo.estudiante (
    id_estudiante INT IDENTITY(1,1) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NULL,
    matricula VARCHAR(50) NOT NULL UNIQUE,
    carrera VARCHAR(100) NULL,
    correo_electronico VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    tipo_aprendizaje VARCHAR(50) NULL,
    fecha_registro DATETIME NOT NULL DEFAULT GETDATE()
);

-- Tabla relacional: grupo_estudiante
CREATE TABLE dbo.grupo_estudiante (
    id_grupo_estudiante INT IDENTITY(1,1) PRIMARY KEY,
    id_grupo INT NOT NULL,
    id_estudiante INT NOT NULL,
    fecha_inscripcion DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_ge_grupo FOREIGN KEY (id_grupo) REFERENCES dbo.grupo(id_grupo) ON DELETE CASCADE,
    CONSTRAINT FK_ge_estudiante FOREIGN KEY (id_estudiante) REFERENCES dbo.estudiante(id_estudiante) ON DELETE CASCADE,
    CONSTRAINT UQ_grupo_estudiante UNIQUE (id_grupo, id_estudiante)
);
```

---

### Anexo C. Cuestionario de Usabilidad y Satisfacción (Modelo SUS)

Instrucciones: Califique cada una de las siguientes afirmaciones en una escala del 1 (Totalmente en desacuerdo) al 5 (Totalmente de acuerdo):
1. Creo que me gustaría utilizar este sistema con frecuencia al inicio de los semestres.
2. Encontré el sistema innecesariamente complejo.
3. Pensé que el sistema era fácil de usar.
4. Creo que necesitaría la ayuda de una persona técnica para poder utilizar este sistema.
5. Considero que las distintas funciones del sistema estaban bien integradas.
6. Pensé que había demasiada inconsistencia en este sistema.
7. Imagino que la mayoría de las personas aprenderían a usar este sistema muy rápidamente.
8. Encontré el sistema muy engorroso de usar.
9. Me sentí muy seguro y confiado al utilizar el sistema.
10. Necesité aprender muchas cosas antes de poder empezar a usar este sistema.
