USE ColegiosDB;
GO

-- 1. Vista de Notas Completas
CREATE OR ALTER VIEW VW_NotasCompletas AS
SELECT 
    n.NotaID,
    e.EstudianteID,
    e.Nombre + ' ' + e.Apellido AS NombreEstudiante,
    m.MateriaID,
    m.Nombre AS NombreMateria,
    p.ProfesorID,
    p.Nombre + ' ' + p.Apellido AS NombreProfesor,
    per.PeriodoID,
    per.Nombre AS NombrePeriodo,
    per.AnioLectivo,
    n.Nota,
    n.Observaciones,
    n.FechaRegistro
FROM Notas n
INNER JOIN Estudiantes e ON n.EstudianteID = e.EstudianteID
INNER JOIN Materias m ON n.MateriaID = m.MateriaID
INNER JOIN Profesores p ON n.ProfesorID = p.ProfesorID
INNER JOIN Periodos per ON n.PeriodoID = per.PeriodoID;
GO

-- 2. Vista de Estudiantes por Padre
CREATE OR ALTER VIEW VW_EstudiantesPorPadre AS
SELECT 
    p.PadreID,
    p.Nombre + ' ' + p.Apellido AS NombrePadre,
    e.EstudianteID,
    e.Nombre + ' ' + e.Apellido AS NombreEstudiante,
    e.FechaNacimiento,
    g.Nombre AS NombreGrado,
    e.EstadoID
FROM Estudiantes e
INNER JOIN Padres p ON e.PadreID = p.PadreID
INNER JOIN Grados g ON e.GradoID = g.GradoID;
GO

-- 3. Vista de Cupos Disponibles
CREATE OR ALTER VIEW VW_CuposDisponibles AS
SELECT 
    g.GradoID,
    g.Nombre AS NombreGrado,
    g.Nivel,
    g.CupoMaximo,
    COUNT(m.MatriculaID) AS Matriculados,
    (g.CupoMaximo - COUNT(m.MatriculaID)) AS CuposDisponibles
FROM Grados g
LEFT JOIN Matriculas m ON g.GradoID = m.GradoID AND m.Estado = 'Activa'
GROUP BY g.GradoID, g.Nombre, g.Nivel, g.CupoMaximo;
GO

-- 4. Vista Resumen de Notas
CREATE OR ALTER VIEW VW_ResumenNotas AS
SELECT 
    e.EstudianteID,
    e.Nombre + ' ' + e.Apellido AS NombreEstudiante,
    m.MateriaID,
    m.Nombre AS NombreMateria,
    AVG(n.Nota) AS Promedio
FROM Notas n
INNER JOIN Estudiantes e ON n.EstudianteID = e.EstudianteID
INNER JOIN Materias m ON n.MateriaID = m.MateriaID
GROUP BY e.EstudianteID, e.Nombre, e.Apellido, m.MateriaID, m.Nombre;
GO

-- 5. Vista Matriculas Activas
CREATE OR ALTER VIEW VW_MatriculasActivas AS
SELECT 
    m.MatriculaID,
    e.EstudianteID,
    e.Nombre + ' ' + e.Apellido AS NombreEstudiante,
    g.GradoID,
    g.Nombre AS NombreGrado,
    g.Nivel,
    m.AnioLectivo,
    m.FechaMatricula
FROM Matriculas m
INNER JOIN Estudiantes e ON m.EstudianteID = e.EstudianteID
INNER JOIN Grados g ON m.GradoID = g.GradoID
WHERE m.Estado = 'Activa' AND e.EstadoID = 2;
GO
