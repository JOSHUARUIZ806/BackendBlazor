IF COL_LENGTH('dbo.estudiante', 'tipo_aprendizaje') IS NULL
    ALTER TABLE dbo.estudiante ADD tipo_aprendizaje VARCHAR(50) NULL;