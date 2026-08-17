USE ColegiosDB;
GO

-- Tabla para definir las actividades por materia y periodo
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Actividades')
BEGIN
    CREATE TABLE Actividades (
        ActividadID INT PRIMARY KEY IDENTITY(1,1),
        MateriaID INT FOREIGN KEY REFERENCES Materias(MateriaID),
        PeriodoID INT FOREIGN KEY REFERENCES Periodos(PeriodoID),
        Nombre NVARCHAR(100) NOT NULL,
        Porcentaje DECIMAL(5,2) NOT NULL CHECK (Porcentaje > 0 AND Porcentaje <= 100),
        FechaCreacion DATETIME DEFAULT GETDATE()
    );
END
GO

-- Tabla para registrar las calificaciones de cada estudiante en cada actividad
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NotasActividades')
BEGIN
    CREATE TABLE NotasActividades (
        NotaActividadID INT PRIMARY KEY IDENTITY(1,1),
        ActividadID INT FOREIGN KEY REFERENCES Actividades(ActividadID),
        EstudianteID INT FOREIGN KEY REFERENCES Estudiantes(EstudianteID),
        Nota DECIMAL(4,2) NOT NULL CHECK (Nota >= 0 AND Nota <= 10),
        FechaRegistro DATETIME DEFAULT GETDATE(),
        UNIQUE(ActividadID, EstudianteID)
    );
END
GO
