-- Crear base de datos
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'ColegiosDB')
BEGIN
    CREATE DATABASE ColegiosDB;
END
GO

USE ColegiosDB;
GO

-- 1. Roles
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- 1.1 Catalogos
CREATE TABLE Catalogos (
    id INT PRIMARY KEY,
    Nombre NVARCHAR(100),
    Valor NVARCHAR(100),
    idpadre INT FOREIGN KEY REFERENCES Catalogos(id),
    idestado INT FOREIGN KEY REFERENCES Catalogos(id)
);
GO

-- 2. Usuarios
CREATE TABLE Usuarios (
    UsuarioID INT PRIMARY KEY IDENTITY(1,1),
    Cedula NVARCHAR(15) UNIQUE NOT NULL, -- cedula or 'admin'
    PasswordHash NVARCHAR(256) NOT NULL,
    RoleID INT FOREIGN KEY REFERENCES Roles(RoleID),
    EstadoID INT FOREIGN KEY REFERENCES Catalogos(id) DEFAULT 2,
    FechaCreacion DATETIME DEFAULT GETDATE()
);
GO

-- 3. Profesores
CREATE TABLE Profesores (
    ProfesorID INT PRIMARY KEY IDENTITY(1,1),
    UsuarioID INT UNIQUE FOREIGN KEY REFERENCES Usuarios(UsuarioID),
    Nombre NVARCHAR(50) NOT NULL,
    Apellido NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100),
    Telefono NVARCHAR(20),
    Especialidad NVARCHAR(100)
);
GO

-- 4. Padres
CREATE TABLE Padres (
    PadreID INT PRIMARY KEY IDENTITY(1,1),
    UsuarioID INT UNIQUE FOREIGN KEY REFERENCES Usuarios(UsuarioID),
    Nombre NVARCHAR(50) NOT NULL,
    Apellido NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100),
    Telefono NVARCHAR(20),
    Direccion NVARCHAR(200)
);
GO

-- 5. Grados
CREATE TABLE Grados (
    GradoID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NOT NULL, -- e.g. '8vo EGB', '1ro Bachillerato'
    Nivel NVARCHAR(30), -- 'Básica Superior', 'Bachillerato'
    CupoMaximo INT DEFAULT 30,
    Paralelo NVARCHAR(5) DEFAULT 'A'
);
GO

-- 6. Estudiantes
CREATE TABLE Estudiantes (
    EstudianteID INT PRIMARY KEY IDENTITY(1,1),
    PadreID INT FOREIGN KEY REFERENCES Padres(PadreID),
    Nombre NVARCHAR(50) NOT NULL,
    Apellido NVARCHAR(50) NOT NULL,
    FechaNacimiento DATE,
    GradoID INT FOREIGN KEY REFERENCES Grados(GradoID),
    EstadoID INT FOREIGN KEY REFERENCES Catalogos(id) DEFAULT 2
);
GO

-- 7. Materias
-- Nota: GradoID puede ser nulo si la materia aplica a todos los grados
CREATE TABLE Materias (
    MateriaID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NOT NULL,
    ProfesorID INT FOREIGN KEY REFERENCES Profesores(ProfesorID),
    GradoID INT FOREIGN KEY REFERENCES Grados(GradoID),
    Descripcion NVARCHAR(200)
);
GO

-- 8. Periodos
CREATE TABLE Periodos (
    PeriodoID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(50) NOT NULL, -- e.g. 'Primer Quimestre', 'Segundo Quimestre'
    AnioLectivo NVARCHAR(20), -- e.g. '2025-2026'
    FechaInicio DATE,
    FechaFin DATE,
    EstadoID INT FOREIGN KEY REFERENCES Catalogos(id) DEFAULT 2
);
GO

-- 9. Notas
CREATE TABLE Notas (
    NotaID INT PRIMARY KEY IDENTITY(1,1),
    EstudianteID INT FOREIGN KEY REFERENCES Estudiantes(EstudianteID),
    MateriaID INT FOREIGN KEY REFERENCES Materias(MateriaID),
    PeriodoID INT FOREIGN KEY REFERENCES Periodos(PeriodoID),
    ProfesorID INT FOREIGN KEY REFERENCES Profesores(ProfesorID),
    Nota DECIMAL(4,2) NOT NULL CHECK (Nota >= 0 AND Nota <= 10),
    FechaRegistro DATETIME DEFAULT GETDATE(),
    Observaciones NVARCHAR(500),
    UNIQUE(EstudianteID, MateriaID, PeriodoID)
);
GO

-- 10. Matriculas
CREATE TABLE Matriculas (
    MatriculaID INT PRIMARY KEY IDENTITY(1,1),
    EstudianteID INT FOREIGN KEY REFERENCES Estudiantes(EstudianteID),
    GradoID INT FOREIGN KEY REFERENCES Grados(GradoID),
    AnioLectivo NVARCHAR(20) DEFAULT '2025-2026',
    FechaMatricula DATETIME DEFAULT GETDATE(),
    Estado NVARCHAR(20) DEFAULT 'Activa' CHECK (Estado IN ('Activa', 'Pendiente', 'Retirada'))
);
GO

-- 11. SolicitudesRecalificacion
CREATE TABLE SolicitudesRecalificacion (
    SolicitudID INT PRIMARY KEY IDENTITY(1,1),
    NotaID INT FOREIGN KEY REFERENCES Notas(NotaID),
    PadreID INT FOREIGN KEY REFERENCES Padres(PadreID),
    Motivo NVARCHAR(500) NOT NULL,
    Estado NVARCHAR(20) DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Aprobada', 'Rechazada')),
    NotaAnterior DECIMAL(4,2),
    NotaNueva DECIMAL(4,2),
    FechaSolicitud DATETIME DEFAULT GETDATE(),
    FechaResolucion DATETIME,
    ComentarioProfesor NVARCHAR(500)
);
GO

-- 12. Auditoria
CREATE TABLE Auditoria (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    TablaAfectada NVARCHAR(50),
    Accion NVARCHAR(50),
    RegistroID INT,
    ValorAntiguo NVARCHAR(MAX),
    ValorNuevo NVARCHAR(MAX),
    FechaAccion DATETIME DEFAULT GETDATE(),
    Usuario NVARCHAR(100)
);
GO
