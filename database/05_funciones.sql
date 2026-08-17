USE ColegiosDB;
GO

-- 1. FN_ValidarCedula
CREATE OR ALTER FUNCTION FN_ValidarCedula (@Cedula NVARCHAR(15))
RETURNS BIT
AS
BEGIN
    DECLARE @Valid BIT = 0;
    
    -- Verifica longitud y que solo contenga números
    IF LEN(@Cedula) = 10 AND @Cedula NOT LIKE '%[^0-9]%'
    BEGIN
        DECLARE @Provincia INT = CAST(SUBSTRING(@Cedula, 1, 2) AS INT);
        DECLARE @TercerDigito INT = CAST(SUBSTRING(@Cedula, 3, 1) AS INT);
        
        -- Verifica provincia (01-24) o (30) y tercer dígito (<6)
        IF (@Provincia BETWEEN 1 AND 24 OR @Provincia = 30) AND @TercerDigito < 6
        BEGIN
            DECLARE @Suma INT = 0;
            DECLARE @I INT = 1;
            DECLARE @Digito INT;
            DECLARE @Valor INT;
            
            WHILE @I <= 9
            BEGIN
                SET @Digito = CAST(SUBSTRING(@Cedula, @I, 1) AS INT);
                
                IF @I % 2 <> 0
                BEGIN
                    SET @Valor = @Digito * 2;
                    IF @Valor > 9
                        SET @Valor = @Valor - 9;
                END
                ELSE
                BEGIN
                    SET @Valor = @Digito;
                END
                
                SET @Suma = @Suma + @Valor;
                SET @I = @I + 1;
            END
            
            DECLARE @DecenaSuperior INT;
            IF @Suma % 10 = 0
                SET @DecenaSuperior = @Suma;
            ELSE
                SET @DecenaSuperior = ((@Suma / 10) + 1) * 10;
                
            DECLARE @DigitoVerificador INT = @DecenaSuperior - @Suma;
            DECLARE @DigitoVerificadorCedula INT = CAST(SUBSTRING(@Cedula, 10, 1) AS INT);
            
            IF @DigitoVerificador = @DigitoVerificadorCedula
                SET @Valid = 1;
        END
    END
    
    RETURN @Valid;
END;
GO
