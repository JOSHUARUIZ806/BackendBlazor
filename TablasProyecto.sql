-- ====================================================================
-- Script de Creación de Base de Datos y Tablas
-- Sistema de Evaluación de Aprendizaje Cognitivo
-- ====================================================================

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'Proyecto')
BEGIN
    CREATE DATABASE Proyecto;
END
GO

USE Proyecto;
GO

-- 1. Tabla: docente
IF OBJECT_ID('dbo.docente', 'U') IS NULL
BEGIN
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
END
GO

-- 2. Tabla: grupo
IF OBJECT_ID('dbo.grupo', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.grupo (
        id_grupo INT IDENTITY(1,1) PRIMARY KEY,
        id_docente INT NOT NULL,
        codigo_grupo VARCHAR(20) NOT NULL UNIQUE,
        nombre_grupo VARCHAR(100) NOT NULL,
        descripcion VARCHAR(255) NULL,
        fecha_creacion DATETIME NOT NULL DEFAULT GETDATE(),
        activo BIT NOT NULL DEFAULT 1,
        CONSTRAINT FK_grupo_docente FOREIGN KEY (id_docente) 
            REFERENCES dbo.docente(id_docente) ON DELETE NO ACTION
    );
END
GO

-- 3. Tabla: estudiante
IF OBJECT_ID('dbo.estudiante', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.estudiante (
        id_estudiante INT IDENTITY(1,1) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        apellido_paterno VARCHAR(100) NOT NULL,
        apellido_materno VARCHAR(100) NULL,
        matricula VARCHAR(50) NOT NULL UNIQUE,
        carrera VARCHAR(100) NULL,
        correo_electronico VARCHAR(150) NOT NULL UNIQUE,
        contrasena VARCHAR(255) NOT NULL,
        fecha_registro DATETIME NOT NULL DEFAULT GETDATE()
    );
END
GO

-- 4. Tabla: grupo_estudiante (Relación muchos a muchos entre grupo y estudiante)
IF OBJECT_ID('dbo.grupo_estudiante', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.grupo_estudiante (
        id_grupo_estudiante INT IDENTITY(1,1) PRIMARY KEY,
        id_grupo INT NOT NULL,
        id_estudiante INT NOT NULL,
        fecha_inscripcion DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_grupo_estudiante_grupo FOREIGN KEY (id_grupo) 
            REFERENCES dbo.grupo(id_grupo) ON DELETE CASCADE,
        CONSTRAINT FK_grupo_estudiante_estudiante FOREIGN KEY (id_estudiante) 
            REFERENCES dbo.estudiante(id_estudiante) ON DELETE CASCADE,
        CONSTRAINT UQ_grupo_estudiante UNIQUE (id_grupo, id_estudiante)
    );
END
GO

-- 5. Tabla: resultado_atencion (Prueba de Atención / Color de tinta / Stroop)
IF OBJECT_ID('dbo.resultado_atencion', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.resultado_atencion (
        id_resultado INT IDENTITY(1,1) PRIMARY KEY,
        id_estudiante INT NOT NULL,
        id_grupo INT NULL,
        total_rondas INT NOT NULL,
        aciertos INT NOT NULL,
        errores INT NOT NULL,
        precision_porcentaje DECIMAL(5,2) NOT NULL,
        evaluacion VARCHAR(50) NULL,
        fecha_partida DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_resultado_atencion_estudiante FOREIGN KEY (id_estudiante) 
            REFERENCES dbo.estudiante(id_estudiante) ON DELETE CASCADE,
        CONSTRAINT FK_resultado_atencion_grupo FOREIGN KEY (id_grupo) 
            REFERENCES dbo.grupo(id_grupo) ON DELETE NO ACTION
    );
END
GO

-- 6. Tabla: detalle_ronda_atencion (Detalle por cada ronda de atención)
IF OBJECT_ID('dbo.detalle_ronda_atencion', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.detalle_ronda_atencion (
        id_detalle INT IDENTITY(1,1) PRIMARY KEY,
        id_resultado INT NOT NULL,
        numero_ronda INT NOT NULL,
        palabra_mostrada VARCHAR(50) NOT NULL,
        color_tinta VARCHAR(50) NOT NULL,
        color_elegido VARCHAR(50) NOT NULL,
        es_correcto BIT NOT NULL,
        tiempo_reaccion_ms INT NOT NULL,
        CONSTRAINT FK_detalle_ronda_atencion_resultado FOREIGN KEY (id_resultado) 
            REFERENCES dbo.resultado_atencion(id_resultado) ON DELETE CASCADE
    );
END
GO

-- 7. Tabla: resultado_sucesiones (Prueba de Razonamiento lógico)
IF OBJECT_ID('dbo.resultado_sucesiones', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.resultado_sucesiones (
        id_resultado INT IDENTITY(1,1) PRIMARY KEY,
        id_estudiante INT NOT NULL,
        id_grupo INT NULL,
        total_pruebas INT NOT NULL,
        respuestas_correctas INT NOT NULL,
        respuestas_incorrectas INT NOT NULL,
        tiempo_total_ms INT NOT NULL,
        detalle_pruebas NVARCHAR(MAX) NULL,
        fecha_partida DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_resultado_sucesiones_estudiante FOREIGN KEY (id_estudiante) 
            REFERENCES dbo.estudiante(id_estudiante) ON DELETE CASCADE,
        CONSTRAINT FK_resultado_sucesiones_grupo FOREIGN KEY (id_grupo) 
            REFERENCES dbo.grupo(id_grupo) ON DELETE NO ACTION
    );
END
GO

-- 8. Tabla: resultado_memorama (Prueba de Memoria de trabajo)
IF OBJECT_ID('dbo.resultado_memorama', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.resultado_memorama (
        id_resultado INT IDENTITY(1,1) PRIMARY KEY,
        id_estudiante INT NOT NULL,
        id_grupo INT NULL,
        pares_encontrados INT NOT NULL,
        total_pares INT NOT NULL,
        movimientos INT NOT NULL,
        errores INT NOT NULL,
        precision_porcentaje DECIMAL(5,2) NOT NULL,
        tiempo_segundos INT NOT NULL,
        rating_estrellas INT NULL,
        fecha_partida DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_resultado_memorama_estudiante FOREIGN KEY (id_estudiante) 
            REFERENCES dbo.estudiante(id_estudiante) ON DELETE CASCADE,
        CONSTRAINT FK_resultado_memorama_grupo FOREIGN KEY (id_grupo) 
            REFERENCES dbo.grupo(id_grupo) ON DELETE NO ACTION
    );
END
GO

-- 9. Tabla: resultado_test_trazo (Prueba de Velocidad de procesamiento / Conecta los números)
IF OBJECT_ID('dbo.resultado_test_trazo', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.resultado_test_trazo (
        id_resultado INT IDENTITY(1,1) PRIMARY KEY,
        id_estudiante INT NOT NULL,
        id_grupo INT NULL,
        total_circulos INT NOT NULL,
        aciertos INT NOT NULL,
        errores INT NOT NULL,
        precision_porcentaje DECIMAL(5,2) NOT NULL,
        tiempo_total_ms INT NOT NULL,
        hora_inicio TIME NULL,
        hora_fin TIME NULL,
        fecha_partida DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_resultado_test_trazo_estudiante FOREIGN KEY (id_estudiante) 
            REFERENCES dbo.estudiante(id_estudiante) ON DELETE CASCADE,
        CONSTRAINT FK_resultado_test_trazo_grupo FOREIGN KEY (id_grupo) 
            REFERENCES dbo.grupo(id_grupo) ON DELETE NO ACTION
    );
END
GO

