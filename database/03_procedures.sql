USE ColegiosDB;
GO

-- 1. SP_RegistrarNota
CREATE OR ALTER PROCEDURE SP_RegistrarNota
    @EstudianteID INT,
    @MateriaID INT,
    @PeriodoID INT,
    @ProfesorID INT,
    @Nota DECIMAL(4,2),
    @Observaciones NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Nota < 0 OR @Nota > 10
            THROW 50001, 'La nota debe estar entre 0 y 10.', 1;

        INSERT INTO Notas (EstudianteID, MateriaID, PeriodoID, ProfesorID, Nota, Observaciones)
        VALUES (@EstudianteID, @MateriaID, @PeriodoID, @ProfesorID, @Nota, @Observaciones);
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 2. SP_ActualizarNota
CREATE OR ALTER PROCEDURE SP_ActualizarNota
    @NotaID INT,
    @Nota DECIMAL(4,2),
    @Observaciones NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Nota < 0 OR @Nota > 10
            THROW 50002, 'La nota debe estar entre 0 y 10.', 1;

        UPDATE Notas
        SET Nota = @Nota, Observaciones = @Observaciones
        WHERE NotaID = @NotaID;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 3. SP_EliminarNota
CREATE OR ALTER PROCEDURE SP_EliminarNota
    @NotaID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DELETE FROM Notas WHERE NotaID = @NotaID;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 4. SP_ProcesarRecalificacion
CREATE OR ALTER PROCEDURE SP_ProcesarRecalificacion
    @SolicitudID INT,
    @Estado NVARCHAR(20),
    @NotaNueva DECIMAL(4,2) = NULL,
    @ComentarioProfesor NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF @Estado NOT IN ('Aprobada', 'Rechazada')
            THROW 50003, 'Estado de recalificación inválido.', 1;

        DECLARE @NotaID INT;
        SELECT @NotaID = NotaID FROM SolicitudesRecalificacion WHERE SolicitudID = @SolicitudID;

        UPDATE SolicitudesRecalificacion
        SET Estado = @Estado,
            NotaNueva = @NotaNueva,
            FechaResolucion = GETDATE(),
            ComentarioProfesor = @ComentarioProfesor
        WHERE SolicitudID = @SolicitudID;

        IF @Estado = 'Aprobada' AND @NotaNueva IS NOT NULL
        BEGIN
            UPDATE Notas SET Nota = @NotaNueva WHERE NotaID = @NotaID;
        END
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 5. SP_CrearMatricula
CREATE OR ALTER PROCEDURE SP_CrearMatricula
    @EstudianteID INT,
    @GradoID INT,
    @AnioLectivo NVARCHAR(20) = '2025-2026'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @Cupos INT;
        SELECT @Cupos = CuposDisponibles FROM VW_CuposDisponibles WHERE GradoID = @GradoID;

        IF @Cupos <= 0
            THROW 50004, 'No hay cupos disponibles en este grado.', 1;

        INSERT INTO Matriculas (EstudianteID, GradoID, AnioLectivo, Estado)
        VALUES (@EstudianteID, @GradoID, @AnioLectivo, 'Activa');
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 6. SP_CrearEstudiante
CREATE OR ALTER PROCEDURE SP_CrearEstudiante
    @PadreID INT,
    @Nombre NVARCHAR(50),
    @Apellido NVARCHAR(50),
    @FechaNacimiento DATE,
    @GradoID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO Estudiantes (PadreID, Nombre, Apellido, FechaNacimiento, GradoID, EstadoID)
        VALUES (@PadreID, @Nombre, @Apellido, @FechaNacimiento, @GradoID, 2);
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 7. SP_ActualizarEstudiante
CREATE OR ALTER PROCEDURE SP_ActualizarEstudiante
    @EstudianteID INT,
    @Nombre NVARCHAR(50),
    @Apellido NVARCHAR(50),
    @FechaNacimiento DATE,
    @GradoID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE Estudiantes
        SET Nombre = @Nombre, Apellido = @Apellido, FechaNacimiento = @FechaNacimiento, GradoID = @GradoID
        WHERE EstudianteID = @EstudianteID;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 8. SP_EliminarEstudiante
CREATE OR ALTER PROCEDURE SP_EliminarEstudiante
    @EstudianteID INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        UPDATE Estudiantes SET EstadoID = 3 WHERE EstudianteID = @EstudianteID;
        UPDATE Matriculas SET Estado = 'Retirada' WHERE EstudianteID = @EstudianteID;
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 9. SP_CrearProfesor
CREATE OR ALTER PROCEDURE SP_CrearProfesor
    @UsuarioID INT,
    @Nombre NVARCHAR(50),
    @Apellido NVARCHAR(50),
    @Email NVARCHAR(100),
    @Telefono NVARCHAR(20),
    @Especialidad NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @RoleID INT;
        SELECT @RoleID = RoleID FROM Usuarios WHERE UsuarioID = @UsuarioID;

        IF @RoleID <> 2
            THROW 50005, 'El usuario debe tener el rol de Profesor (RoleID=2).', 1;

        INSERT INTO Profesores (UsuarioID, Nombre, Apellido, Email, Telefono, Especialidad)
        VALUES (@UsuarioID, @Nombre, @Apellido, @Email, @Telefono, @Especialidad);
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO

-- 10. SP_CrearPadre
CREATE OR ALTER PROCEDURE SP_CrearPadre
    @UsuarioID INT,
    @Nombre NVARCHAR(50),
    @Apellido NVARCHAR(50),
    @Email NVARCHAR(100),
    @Telefono NVARCHAR(20),
    @Direccion NVARCHAR(200)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        DECLARE @RoleID INT;
        SELECT @RoleID = RoleID FROM Usuarios WHERE UsuarioID = @UsuarioID;

        IF @RoleID <> 3
            THROW 50006, 'El usuario debe tener el rol de Padre (RoleID=3).', 1;

        INSERT INTO Padres (UsuarioID, Nombre, Apellido, Email, Telefono, Direccion)
        VALUES (@UsuarioID, @Nombre, @Apellido, @Email, @Telefono, @Direccion);
    END TRY
    BEGIN CATCH
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        RAISERROR(@ErrorMessage, 16, 1);
    END CATCH
END;
GO
