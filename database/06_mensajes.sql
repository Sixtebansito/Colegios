-- Creación de la tabla Mensajes para el sistema de chat interno

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Mensajes]') AND type in (N'U'))
BEGIN
    CREATE TABLE Mensajes (
        MensajeID INT PRIMARY KEY IDENTITY(1,1),
        ProfesorID INT NOT NULL,
        PadreID INT NOT NULL,
        Remitente VARCHAR(20) NOT NULL CHECK (Remitente IN ('Profesor', 'Padre')),
        Contenido NVARCHAR(MAX) NOT NULL,
        FechaEnvio DATETIME DEFAULT GETDATE(),
        Leido BIT DEFAULT 0,
        FOREIGN KEY (ProfesorID) REFERENCES Profesores(ProfesorID),
        FOREIGN KEY (PadreID) REFERENCES Padres(PadreID)
    )
END
GO
