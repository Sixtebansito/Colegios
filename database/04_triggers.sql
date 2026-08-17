USE ColegiosDB;
GO

-- 1. TR_AuditoriaNota_Insert
CREATE OR ALTER TRIGGER TR_AuditoriaNota_Insert
ON Notas
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Auditoria (TablaAfectada, Accion, RegistroID, ValorAntiguo, ValorNuevo, Usuario)
    SELECT 
        'Notas', 
        'INSERT', 
        i.NotaID, 
        NULL, 
        CAST(i.Nota AS NVARCHAR(MAX)), 
        SYSTEM_USER
    FROM inserted i;
END;
GO

-- 2. TR_AuditoriaNota_Update
CREATE OR ALTER TRIGGER TR_AuditoriaNota_Update
ON Notas
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Auditoria (TablaAfectada, Accion, RegistroID, ValorAntiguo, ValorNuevo, Usuario)
    SELECT 
        'Notas', 
        'UPDATE', 
        i.NotaID, 
        CAST(d.Nota AS NVARCHAR(MAX)), 
        CAST(i.Nota AS NVARCHAR(MAX)), 
        SYSTEM_USER
    FROM inserted i
    INNER JOIN deleted d ON i.NotaID = d.NotaID;
END;
GO

-- 3. TR_AuditoriaNota_Delete
CREATE OR ALTER TRIGGER TR_AuditoriaNota_Delete
ON Notas
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO Auditoria (TablaAfectada, Accion, RegistroID, ValorAntiguo, ValorNuevo, Usuario)
    SELECT 
        'Notas', 
        'DELETE', 
        d.NotaID, 
        CAST(d.Nota AS NVARCHAR(MAX)), 
        NULL, 
        SYSTEM_USER
    FROM deleted d;
END;
GO
