import pyodbc
from config import Config
import os
import glob
from werkzeug.security import generate_password_hash

def execute_sql_file(cursor, filepath):
    print(f"Executing {os.path.basename(filepath)}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # Split on GO
    batches = [b for b in sql.split('GO\n') if b.strip()]
    for batch in batches:
        if batch.strip():
            try:
                cursor.execute(batch)
                cursor.commit()
            except pyodbc.Error as e:
                print(f"Error executing batch in {filepath}: {e}")

def seed_data(cursor):
    print("Checking for existing data...")
    cursor.execute("SELECT COUNT(*) FROM Catalogos")
    if cursor.fetchone()[0] > 0:
        print("Data already exists. Skipping seed.")
        return

    print("Seeding Catalogos...")
    cursor.execute("INSERT INTO Catalogos (id, Nombre, Valor, idpadre, idestado) VALUES (1, 'ESTADO', NULL, NULL, NULL)")
    cursor.execute("INSERT INTO Catalogos (id, Nombre, Valor, idpadre, idestado) VALUES (2, NULL, 'ACTIVO', 1, 2)")
    cursor.execute("INSERT INTO Catalogos (id, Nombre, Valor, idpadre, idestado) VALUES (3, NULL, 'INACTIVO', 1, 2)")
    cursor.commit()

    print("Seeding Roles...")
    cursor.execute("INSERT INTO Roles (Nombre) VALUES ('Admin'), ('Profesor'), ('Padre')")
    cursor.commit()

    print("Seeding Admin user...")
    pwd = generate_password_hash('1234', method='pbkdf2:sha256')
    cursor.execute("INSERT INTO Usuarios (Cedula, PasswordHash, RoleID) VALUES (?, ?, ?)", 'admin', pwd, 1)
    cursor.commit()

    print("Seeding Grados...")
    grados = [
        ('8vo EGB', 'Básica Superior', 30),
        ('9no EGB', 'Básica Superior', 30),
        ('10mo EGB', 'Básica Superior', 30),
        ('1ro Bachillerato', 'Bachillerato', 25),
        ('2do Bachillerato', 'Bachillerato', 25),
        ('3ro Bachillerato', 'Bachillerato', 25)
    ]
    for g in grados:
        cursor.execute("INSERT INTO Grados (Nombre, Nivel, CupoMaximo) VALUES (?, ?, ?)", g[0], g[1], g[2])
    cursor.commit()

    print("Seeding Periodos...")
    periodos = [
        ('Primer Quimestre', '2025-2026', '2025-09-01', '2026-01-31'),
        ('Segundo Quimestre', '2025-2026', '2026-02-01', '2026-07-15')
    ]
    for p in periodos:
        cursor.execute("INSERT INTO Periodos (Nombre, AnioLectivo, FechaInicio, FechaFin) VALUES (?, ?, ?, ?)", p[0], p[1], p[2], p[3])
    cursor.commit()

    print("Seeding Professores...")
    profesores = [
        ('1745678902', 'Juan', 'García', 'juan.garcia@colegio.edu.ec', 'Matemáticas y Ed. Física'),
        ('0923456784', 'Patricia', 'Vega', 'patricia.vega@colegio.edu.ec', 'Lengua y Arte'),
        ('1756789010', 'Roberto', 'Sánchez', 'roberto.sanchez@colegio.edu.ec', 'Ciencias e Informática'),
        ('0534567896', 'Diana', 'Cruz', 'diana.cruz@colegio.edu.ec', 'Estudios Sociales'),
        ('1312346784', 'Andrés', 'Maldonado', 'andres.maldonado@colegio.edu.ec', 'Inglés'),
        ('1712348902', 'Elena', 'Ruiz', 'elena.ruiz@colegio.edu.ec', 'Química'),
        ('0923458901', 'Marcos', 'Flores', 'marcos.flores@colegio.edu.ec', 'Física'),
        ('1756781234', 'Teresa', 'Gómez', 'teresa.gomez@colegio.edu.ec', 'Biología'),
        ('0534561234', 'Diego', 'Castro', 'diego.castro@colegio.edu.ec', 'Historia'),
        ('1312341234', 'Sofía', 'Ortiz', 'sofia.ortiz@colegio.edu.ec', 'Filosofía')
    ]
    for ced, nom, ape, email, esp in profesores:
        cursor.execute("SELECT dbo.FN_ValidarCedula(?)", ced)
        if not cursor.fetchone()[0]:
            print(f"Warning: Cedula {ced} failed validation, but inserting anyway for test")
        
        pwd = generate_password_hash(ced, method='pbkdf2:sha256')
        cursor.execute("INSERT INTO Usuarios (Cedula, PasswordHash, RoleID) OUTPUT inserted.UsuarioID VALUES (?, ?, ?)", ced, pwd, 2)
        uid = cursor.fetchone()[0]
        cursor.execute("INSERT INTO Profesores (UsuarioID, Nombre, Apellido, Email, Especialidad) VALUES (?, ?, ?, ?, ?)", uid, nom, ape, email, esp)
    cursor.commit()

    print("Seeding Padres...")
    padres = [
        ('1712345675', 'María', 'López', 'maria.lopez@gmail.com', '0991234567'),
        ('1723456784', 'Carlos', 'Mendoza', 'carlos.mendoza@gmail.com', '0992345678'),
        ('0912345675', 'Ana', 'Gutiérrez', 'ana.gutierrez@gmail.com', '0993456789'),
        ('1701234567', 'Pedro', 'Ramírez', 'pedro.ramirez@gmail.com', '0994567890'),
        ('1734567892', 'Lucía', 'Morales', 'lucia.morales@gmail.com', '0995678901'),
        ('0501234561', 'Fernando', 'Torres', 'fernando.torres@gmail.com', '0996789012'),
        ('1312345679', 'Rosa', 'Jiménez', 'rosa.jimenez@gmail.com', '0997890123'),
        ('0102345675', 'José', 'Paredes', 'jose.paredes@gmail.com', '0998901234'),
        ('1812345674', 'Carmen', 'Suárez', 'carmen.suarez@gmail.com', '0999012345'),
        ('2012345670', 'Miguel', 'Herrera', 'miguel.herrera@gmail.com', '0990123456')
    ]
    for ced, nom, ape, email, tel in padres:
        cursor.execute("SELECT dbo.FN_ValidarCedula(?)", ced)
        if not cursor.fetchone()[0]:
            print(f"Warning: Cedula {ced} failed validation, but inserting anyway for test")

        pwd = generate_password_hash(ced, method='pbkdf2:sha256')
        cursor.execute("INSERT INTO Usuarios (Cedula, PasswordHash, RoleID) OUTPUT inserted.UsuarioID VALUES (?, ?, ?)", ced, pwd, 3)
        uid = cursor.fetchone()[0]
        cursor.execute("INSERT INTO Padres (UsuarioID, Nombre, Apellido, Email, Telefono) VALUES (?, ?, ?, ?, ?)", uid, nom, ape, email, tel)
    cursor.commit()

    print("Seeding Estudiantes...")
    estudiantes = [
        ('Sofía', 'López', 1, 1),
        ('Mateo', 'López', 1, 3),
        ('Valentina', 'Mendoza', 2, 2),
        ('Sebastián', 'Gutiérrez', 3, 4),
        ('Isabella', 'Ramírez', 4, 1),
        ('Daniel', 'Morales', 5, 5),
        ('Camila', 'Torres', 6, 2),
        ('Alejandro', 'Jiménez', 7, 3),
        ('Gabriela', 'Paredes', 8, 4),
        ('Nicolás', 'Suárez', 9, 6),
        ('Martina', 'Herrera', 10, 1)
    ]
    for nom, ape, pid, gid in estudiantes:
        cursor.execute("INSERT INTO Estudiantes (PadreID, Nombre, Apellido, GradoID) VALUES (?, ?, ?, ?)", pid, nom, ape, gid)
    cursor.commit()

    print("Seeding Materias...")
    materias = [
        ('Matemáticas', 1),
        ('Lengua y Literatura', 2),
        ('Ciencias Naturales', 3),
        ('Estudios Sociales', 4),
        ('Inglés', 5),
        ('Educación Física', 1),
        ('Arte y Cultura', 2),
        ('Informática', 3),
        ('Química', 6),
        ('Física', 7)
    ]
    for nom, prof_id in materias:
        cursor.execute("INSERT INTO Materias (Nombre, ProfesorID) VALUES (?, ?)", nom, prof_id)
    cursor.commit()

    print("Seeding Matriculas...")
    for i in range(1, 12):
        cursor.execute("SELECT GradoID FROM Estudiantes WHERE EstudianteID = ?", i)
        gid = cursor.fetchone()[0]
        cursor.execute("INSERT INTO Matriculas (EstudianteID, GradoID, AnioLectivo, Estado) VALUES (?, ?, ?, ?)", i, gid, '2025-2026', 'Activa')
    cursor.commit()

    print("Seeding Notas...")
    import random
    random.seed(42)
    # Studs 1-9, 11 (Skip 10 = Nicolás)
    studs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11]
    
    # Periodo 1
    for s in studs:
        mat_ids = random.sample(range(1, 9), random.randint(4, 6))
        for m in mat_ids:
            cursor.execute("SELECT ProfesorID FROM Materias WHERE MateriaID = ?", m)
            prof_id = cursor.fetchone()[0]
            nota = round(random.uniform(5.0, 10.0), 2)
            cursor.execute("INSERT INTO Notas (EstudianteID, MateriaID, PeriodoID, ProfesorID, Nota) VALUES (?, ?, ?, ?, ?)", s, m, 1, prof_id, nota)
            
    # Periodo 2 (only some)
    for s in studs[:5]:
        mat_ids = random.sample(range(1, 9), random.randint(2, 4))
        for m in mat_ids:
            cursor.execute("SELECT ProfesorID FROM Materias WHERE MateriaID = ?", m)
            prof_id = cursor.fetchone()[0]
            nota = round(random.uniform(5.0, 10.0), 2)
            cursor.execute("INSERT INTO Notas (EstudianteID, MateriaID, PeriodoID, ProfesorID, Nota) VALUES (?, ?, ?, ?, ?)", s, m, 2, prof_id, nota)

    cursor.commit()
    print("Seed complete.")

def main():
    # Connect to master first to ensure DB creation
    conn_str_master = Config.get_connection_string(database='master')
    try:
        conn = pyodbc.connect(conn_str_master, autocommit=True)
        cursor = conn.cursor()
        
        # We need to extract the DB creation from 01_crear_tablas.sql
        print("Ensuring ColegiosDB exists...")
        cursor.execute("IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'ColegiosDB') BEGIN CREATE DATABASE ColegiosDB; END")
        conn.close()
    except pyodbc.Error as e:
        print(f"Error connecting to master: {e}")
        return

    # Now connect to ColegiosDB
    print("Connecting to ColegiosDB...")
    conn_str = Config.get_connection_string()
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        files = [
            'database/01_crear_tablas.sql',
            'database/02_vistas.sql',
            'database/03_procedures.sql',
            'database/04_triggers.sql',
            'database/05_funciones.sql',
            'database/06_mensajes.sql'
        ]
        
        base_dir = os.path.dirname(os.path.abspath(__file__))
        for f in files:
            filepath = os.path.join(base_dir, f)
            if os.path.exists(filepath):
                execute_sql_file(cursor, filepath)
            else:
                print(f"File not found: {filepath}")
                
        seed_data(cursor)
        
        conn.close()
        print("Database initialization completed successfully.")
        
    except pyodbc.Error as e:
        print(f"Database error: {e}")

if __name__ == "__main__":
    main()
