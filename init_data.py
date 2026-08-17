import os
import random
from utils import get_db_connection

def split_sql(sql):
    """Split SQL script by GO statements"""
    statements = []
    current_statement = []
    
    for line in sql.split('\n'):
        if line.strip().upper() == 'GO':
            if current_statement:
                statements.append('\n'.join(current_statement))
                current_statement = []
        else:
            current_statement.append(line)
            
    if current_statement:
        statements.append('\n'.join(current_statement))
        
    return [s.strip() for s in statements if s.strip()]

def init_data():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 1. Update Materias without GradoID (assign them to first Grado randomly or GradoID 1)
        print("Asignando GradoID a Materias huérfanas...")
        cursor.execute("SELECT GradoID FROM Grados")
        grados = [r[0] for r in cursor.fetchall()]
        if grados:
            grado_id = grados[0]
            cursor.execute("UPDATE Materias SET GradoID = ? WHERE GradoID IS NULL", grado_id)
            conn.commit()
            
        # 2. Execute 06_mensajes and 07_actividades
        base_dir = os.path.dirname(os.path.abspath(__file__))
        scripts = ['database/06_mensajes.sql', 'database/07_actividades.sql']
        
        for script_path in scripts:
            full_path = os.path.join(base_dir, script_path)
            if os.path.exists(full_path):
                print(f"Ejecutando script {script_path}...")
                with open(full_path, 'r', encoding='utf-8') as f:
                    sql = f.read()
                    for statement in split_sql(sql):
                        cursor.execute(statement)
                conn.commit()

        # 3. Insert Dummy Activities and Grades
        print("Insertando actividades de prueba y notas...")
        # Get active periodos
        cursor.execute("SELECT PeriodoID FROM Periodos WHERE EstadoID = 2")
        periodos = cursor.fetchall()
        
        # Get all materias
        cursor.execute("SELECT MateriaID, ProfesorID, GradoID FROM Materias WHERE GradoID IS NOT NULL")
        materias = cursor.fetchall()
        
        for m in materias:
            for p in periodos:
                # Create activities for this materia and periodo if not exist
                cursor.execute("SELECT ActividadID FROM Actividades WHERE MateriaID = ? AND PeriodoID = ?", m.MateriaID, p.PeriodoID)
                actividades = cursor.fetchall()
                if not actividades:
                    cursor.execute("""
                        INSERT INTO Actividades (MateriaID, PeriodoID, Nombre, Porcentaje)
                        OUTPUT INSERTED.ActividadID
                        VALUES (?, ?, 'Deberes', 30), (?, ?, 'Lecciones', 30), (?, ?, 'Examen', 40)
                    """, m.MateriaID, p.PeriodoID, m.MateriaID, p.PeriodoID, m.MateriaID, p.PeriodoID)
                    
                    actividades = cursor.fetchall()
                    conn.commit()
                
                # Get students for this materia's GradoID
                cursor.execute("SELECT EstudianteID FROM Matriculas WHERE GradoID = ? AND Estado = 'Activa'", m.GradoID)
                estudiantes = cursor.fetchall()
                
                for est in estudiantes:
                    total_nota = 0
                    for (i, act) in enumerate(actividades):
                        # Generate random grade between 6.0 and 10.0
                        nota_act = round(random.uniform(6.0, 10.0), 2)
                        
                        # Insert into NotasActividades if not exists
                        cursor.execute("SELECT NotaActividadID FROM NotasActividades WHERE ActividadID = ? AND EstudianteID = ?", act.ActividadID, est.EstudianteID)
                        if not cursor.fetchone():
                            cursor.execute("""
                                INSERT INTO NotasActividades (ActividadID, EstudianteID, Nota)
                                VALUES (?, ?, ?)
                            """, act.ActividadID, est.EstudianteID, nota_act)
                            
                        # Calculate weighted sum based on activity name
                        porcentaje = 30 if i < 2 else 40
                        total_nota += nota_act * (porcentaje / 100.0)
                        
                    # Insert or update total Nota in Notas table
                    total_nota = round(total_nota, 2)
                    cursor.execute("SELECT NotaID FROM Notas WHERE EstudianteID = ? AND MateriaID = ? AND PeriodoID = ?", est.EstudianteID, m.MateriaID, p.PeriodoID)
                    nota_row = cursor.fetchone()
                    
                    if not nota_row:
                        cursor.execute("""
                            INSERT INTO Notas (EstudianteID, MateriaID, PeriodoID, ProfesorID, Nota)
                            VALUES (?, ?, ?, ?, ?)
                        """, est.EstudianteID, m.MateriaID, p.PeriodoID, m.ProfesorID, total_nota)
                    else:
                        cursor.execute("""
                            UPDATE Notas SET Nota = ? WHERE NotaID = ?
                        """, total_nota, nota_row.NotaID)
                        
        conn.commit()
        print("¡Datos generados y scripts ejecutados con éxito!")
        
    except Exception as e:
        print(f"Error: {e}")
        if conn: conn.rollback()
    finally:
        if conn: conn.close()

if __name__ == '__main__':
    init_data()
