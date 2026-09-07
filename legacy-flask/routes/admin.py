from flask import Blueprint, render_template, request, jsonify, session
from werkzeug.security import generate_password_hash
from utils import get_db_connection, login_required, role_required, validar_cedula

bp = Blueprint('admin', __name__)

@bp.route('/')
@login_required
@role_required(1)
def dashboard():
    conn = None
    estudiantes_count = profesores_count = padres_count = notas_count = pendientes_count = 0
    auditoria = []
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM Estudiantes WHERE EstadoID = 2")
        estudiantes_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Profesores")
        profesores_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Padres")
        padres_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM Notas")
        notas_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM SolicitudesRecalificacion WHERE Estado = 'Pendiente'")
        pendientes_count = cursor.fetchone()[0]
        cursor.execute("SELECT TOP 10 * FROM Auditoria ORDER BY FechaAccion DESC")
        columns = [column[0] for column in cursor.description]
        auditoria = [dict(zip(columns, row)) for row in cursor.fetchall()]
        for d in auditoria:
            if d.get('FechaAccion'):
                d['FechaAccion'] = d['FechaAccion'].strftime('%Y-%m-%d %H:%M')
    except Exception as e:
        print(f"Dashboard error: {e}")
    finally:
        if conn: conn.close()
    return render_template('admin/dashboard.html',
                           estudiantes_count=estudiantes_count,
                           profesores_count=profesores_count,
                           padres_count=padres_count,
                           notas_count=notas_count,
                           pendientes_count=pendientes_count,
                           auditoria=auditoria)

# ==========================================
# CRUD PROFESORES
# ==========================================
@bp.route('/profesores', methods=['GET'])
@login_required
@role_required(1)
def profesores_view():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, u.Cedula, u.EstadoID 
            FROM Profesores p
            JOIN Usuarios u ON p.UsuarioID = u.UsuarioID
            WHERE u.EstadoID = 2
        """)
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return render_template('admin/profesores.html', profesores=data)
    except Exception as e:
        return f"Error: {e}", 500
    finally:
        if conn: conn.close()

@bp.route('/profesores', methods=['POST'])
@login_required
@role_required(1)
def profesores_create():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if cedula is valid
        if not validar_cedula(data['cedula']):
            return jsonify({'success': False, 'message': 'Cédula inválida (Módulo 10)'})
        
        # Check if cedula exists
        cursor.execute("SELECT UsuarioID FROM Usuarios WHERE Cedula = ?", data['cedula'])
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'Cédula ya registrada'})
            
        hashed_pw = generate_password_hash(data['cedula'], method='pbkdf2:sha256')
        
        # Insert User
        cursor.execute("""
            INSERT INTO Usuarios (Cedula, PasswordHash, RoleID, EstadoID) 
            OUTPUT INSERTED.UsuarioID
            VALUES (?, ?, 2, 2)
        """, data['cedula'], hashed_pw)
        user_id = cursor.fetchone().UsuarioID
        
        # Insert Profesor
        cursor.execute("""
            INSERT INTO Profesores (UsuarioID, Nombre, Apellido, Email, Telefono, Especialidad)
            VALUES (?, ?, ?, ?, ?, ?)
        """, user_id, data['nombre'], data['apellido'], data['email'], data['telefono'], data['especialidad'])
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Profesor creado exitosamente'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/profesores/<int:id>', methods=['PUT'])
@login_required
@role_required(1)
def profesores_update(id):
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if not validar_cedula(data['cedula']):
            return jsonify({'success': False, 'message': 'Cédula ecuatoriana inválida'})
            
        cursor.execute("SELECT UsuarioID FROM Profesores WHERE ProfesorID = ?", id)
        row = cursor.fetchone()
        if not row:
            return jsonify({'success': False, 'message': 'Profesor no encontrado'})
            
        user_id = row.UsuarioID
        
        # Check cedula if changed
        cursor.execute("SELECT UsuarioID FROM Usuarios WHERE Cedula = ? AND UsuarioID != ?", data['cedula'], user_id)
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'Cédula ya registrada por otro usuario'})
            
        cursor.execute("UPDATE Usuarios SET Cedula = ? WHERE UsuarioID = ?", data['cedula'], user_id)
        
        cursor.execute("""
            UPDATE Profesores 
            SET Nombre = ?, Apellido = ?, Email = ?, Telefono = ?, Especialidad = ?
            WHERE ProfesorID = ?
        """, data['nombre'], data['apellido'], data['email'], data['telefono'], data['especialidad'], id)
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Profesor actualizado'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/profesores/<int:id>', methods=['DELETE'])
@login_required
@role_required(1)
def profesores_delete(id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT UsuarioID FROM Profesores WHERE ProfesorID = ?", id)
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE Usuarios SET EstadoID = 3 WHERE UsuarioID = ?", row.UsuarioID)
            conn.commit()
            return jsonify({'success': True, 'message': 'Profesor desactivado'})
        return jsonify({'success': False, 'message': 'Profesor no encontrado'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

# ==========================================
# CRUD PADRES
# ==========================================
@bp.route('/padres', methods=['GET'])
@login_required
@role_required(1)
def padres_view():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, u.Cedula, u.EstadoID 
            FROM Padres p
            JOIN Usuarios u ON p.UsuarioID = u.UsuarioID
            WHERE u.EstadoID = 2
        """)
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return render_template('admin/padres.html', padres=data)
    except Exception as e:
        return f"Error: {e}", 500
    finally:
        if conn: conn.close()

@bp.route('/padres', methods=['POST'])
@login_required
@role_required(1)
def padres_create():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if cedula is valid
        if not validar_cedula(data['cedula']):
            return jsonify({'success': False, 'message': 'Cédula inválida (Módulo 10)'})
            
        cursor.execute("SELECT UsuarioID FROM Usuarios WHERE Cedula = ?", data['cedula'])
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'La cédula ya está registrada para otro usuario/padre'})
            
        hashed_pw = generate_password_hash(data['cedula'], method='pbkdf2:sha256')
        
        cursor.execute("""
            INSERT INTO Usuarios (Cedula, PasswordHash, RoleID, EstadoID) 
            OUTPUT INSERTED.UsuarioID
            VALUES (?, ?, 3, 2)
        """, data['cedula'], hashed_pw)
        user_id = cursor.fetchone().UsuarioID
        
        cursor.execute("""
            INSERT INTO Padres (UsuarioID, Nombre, Apellido, Email, Telefono, Direccion)
            VALUES (?, ?, ?, ?, ?, ?)
        """, user_id, data['nombre'], data['apellido'], data['email'], data['telefono'], data['direccion'])
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Padre creado exitosamente'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/padres/<int:id>', methods=['PUT'])
@login_required
@role_required(1)
def padres_update(id):
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if not validar_cedula(data['cedula']):
            return jsonify({'success': False, 'message': 'Cédula ecuatoriana inválida'})
            
        cursor.execute("SELECT UsuarioID FROM Padres WHERE PadreID = ?", id)
        row = cursor.fetchone()
        if not row:
            return jsonify({'success': False, 'message': 'Padre no encontrado'})
            
        user_id = row.UsuarioID
        
        cursor.execute("SELECT UsuarioID FROM Usuarios WHERE Cedula = ? AND UsuarioID != ?", data['cedula'], user_id)
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'Cédula ya registrada'})
            
        cursor.execute("UPDATE Usuarios SET Cedula = ? WHERE UsuarioID = ?", data['cedula'], user_id)
        
        cursor.execute("""
            UPDATE Padres 
            SET Nombre = ?, Apellido = ?, Email = ?, Telefono = ?, Direccion = ?
            WHERE PadreID = ?
        """, data['nombre'], data['apellido'], data['email'], data['telefono'], data['direccion'], id)
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Padre actualizado'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/padres/<int:id>', methods=['DELETE'])
@login_required
@role_required(1)
def padres_delete(id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT UsuarioID FROM Padres WHERE PadreID = ?", id)
        row = cursor.fetchone()
        if row:
            cursor.execute("UPDATE Usuarios SET EstadoID = 3 WHERE UsuarioID = ?", row.UsuarioID)
            conn.commit()
            return jsonify({'success': True, 'message': 'Padre desactivado'})
        return jsonify({'success': False, 'message': 'Padre no encontrado'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

# ==========================================
# CRUD ESTUDIANTES
# ==========================================
@bp.route('/estudiantes', methods=['GET'])
@login_required
@role_required(1)
def estudiantes_view():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT e.*, p.Nombre as PadreNombre, p.Apellido as PadreApellido,
                   g.Nombre as GradoNombre
            FROM Estudiantes e
            LEFT JOIN Padres p ON e.PadreID = p.PadreID
            LEFT JOIN Grados g ON e.GradoID = g.GradoID
        """)
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        for d in data:
            if d.get('FechaNacimiento'):
                d['FechaNacimiento'] = d['FechaNacimiento'].strftime('%Y-%m-%d')
                
        return render_template('admin/estudiantes.html', estudiantes=data)
    except Exception as e:
        return f"Error: {e}", 500
    finally:
        if conn: conn.close()

@bp.route('/estudiantes', methods=['POST'])
@login_required
@role_required(1)
def estudiantes_create():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT EstudianteID FROM Estudiantes WHERE Nombre = ? AND Apellido = ?", data['nombre'], data['apellido'])
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'El estudiante ya está registrado'})
            
        cursor.execute("""
            INSERT INTO Estudiantes (PadreID, Nombre, Apellido, FechaNacimiento, GradoID, EstadoID)
            VALUES (?, ?, ?, ?, ?, 2)
        """, data.get('padre_id') or None, data['nombre'], data['apellido'], data.get('fecha_nacimiento') or None, data.get('grado_id') or None)
        conn.commit()
        return jsonify({'success': True, 'message': 'Estudiante creado'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/estudiantes/<int:id>', methods=['PUT'])
@login_required
@role_required(1)
def estudiantes_update(id):
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE Estudiantes 
            SET PadreID = ?, Nombre = ?, Apellido = ?, FechaNacimiento = ?, GradoID = ?
            WHERE EstudianteID = ?
        """, data.get('padre_id') or None, data['nombre'], data['apellido'], data.get('fecha_nacimiento') or None, data.get('grado_id') or None, id)
        conn.commit()
        return jsonify({'success': True, 'message': 'Estudiante actualizado'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/estudiantes/<int:id>', methods=['DELETE'])
@login_required
@role_required(1)
def estudiantes_delete(id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE Estudiantes SET EstadoID = 3 WHERE EstudianteID = ?", id)
        conn.commit()
        return jsonify({'success': True, 'message': 'Estudiante desactivado'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

# ==========================================
# CRUD MATERIAS
# ==========================================
@bp.route('/materias', methods=['GET'])
@login_required
@role_required(1)
def materias_view():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT m.*, p.Nombre as ProfesorNombre, p.Apellido as ProfesorApellido, g.Nombre as GradoNombre
            FROM Materias m
            LEFT JOIN Profesores p ON m.ProfesorID = p.ProfesorID
            LEFT JOIN Grados g ON m.GradoID = g.GradoID
        """)
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return render_template('admin/materias.html', materias=data)
    except Exception as e:
        return f"Error: {e}", 500
    finally:
        if conn: conn.close()

@bp.route('/materias', methods=['POST'])
@login_required
@role_required(1)
def materias_create():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Materias (Nombre, ProfesorID, GradoID, Descripcion)
            VALUES (?, ?, ?, ?)
        """, data['nombre'], data.get('profesor_id') or None, data.get('grado_id') or None, data.get('descripcion'))
        conn.commit()
        return jsonify({'success': True, 'message': 'Materia creada'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/materias/<int:id>', methods=['PUT'])
@login_required
@role_required(1)
def materias_update(id):
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE Materias 
            SET Nombre = ?, ProfesorID = ?, GradoID = ?, Descripcion = ?
            WHERE MateriaID = ?
        """, data['nombre'], data.get('profesor_id') or None, data.get('grado_id') or None, data.get('descripcion'), id)
        conn.commit()
        return jsonify({'success': True, 'message': 'Materia actualizada'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/materias/<int:id>', methods=['DELETE'])
@login_required
@role_required(1)
def materias_delete(id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Materias WHERE MateriaID = ?", id)
        conn.commit()
        return jsonify({'success': True, 'message': 'Materia eliminada'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

# ==========================================
# CRUD MATRICULAS
# ==========================================
@bp.route('/matriculas', methods=['GET'])
@login_required
@role_required(1)
def matriculas_view():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT m.*, e.Nombre + ' ' + e.Apellido AS NombreEstudiante, g.Nombre AS NombreGrado 
            FROM Matriculas m
            JOIN Estudiantes e ON m.EstudianteID = e.EstudianteID
            JOIN Grados g ON m.GradoID = g.GradoID
        """)
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        for d in data:
            if d.get('FechaMatricula'):
                d['FechaMatricula'] = d['FechaMatricula'].strftime('%Y-%m-%d %H:%M')
                
        return render_template('admin/matriculas.html', matriculas=data)
    except Exception as e:
        return f"Error: {e}", 500
    finally:
        if conn: conn.close()

@bp.route('/matriculas', methods=['POST'])
@login_required
@role_required(1)
def matriculas_create():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Matriculas (EstudianteID, GradoID, AnioLectivo, Estado)
            VALUES (?, ?, ?, ?)
        """, data['estudiante_id'], data['grado_id'], data['anio_lectivo'], data.get('estado', 'Activa'))
        conn.commit()
        return jsonify({'success': True, 'message': 'Matrícula creada'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/matriculas/<int:id>', methods=['PUT'])
@login_required
@role_required(1)
def matriculas_update(id):
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE Matriculas 
            SET EstudianteID = ?, GradoID = ?, AnioLectivo = ?, Estado = ?
            WHERE MatriculaID = ?
        """, data['estudiante_id'], data['grado_id'], data['anio_lectivo'], data['estado'], id)
        conn.commit()
        return jsonify({'success': True, 'message': 'Matrícula actualizada'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/matriculas/<int:id>', methods=['DELETE'])
@login_required
@role_required(1)
def matriculas_delete(id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE Matriculas SET Estado = 'Retirada' WHERE MatriculaID = ?", id)
        conn.commit()
        return jsonify({'success': True, 'message': 'Matrícula inactivada'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

# ==========================================
# AUDITORIA
# ==========================================
@bp.route('/auditoria', methods=['GET'])
@login_required
@role_required(1)
def auditoria_view():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT TOP 1000 * FROM Auditoria ORDER BY FechaAccion DESC")
        columns = [column[0] for column in cursor.description]
        data = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        for d in data:
            if d.get('FechaAccion'):
                d['FechaAccion'] = d['FechaAccion'].strftime('%Y-%m-%d %H:%M')
                
        return render_template('admin/auditoria.html', auditoria=data)
    except Exception as e:
        return f"Error: {e}", 500
    finally:
        if conn: conn.close()

# ==========================================
# API DROPDOWNS
# ==========================================
@bp.route('/api/padres')
@login_required
def api_padres():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT PadreID as id, Nombre + ' ' + Apellido as nombre FROM Padres")
    columns = [column[0] for column in cursor.description]
    res = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(res)

@bp.route('/api/profesores')
@login_required
def api_profesores():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT ProfesorID as id, Nombre + ' ' + Apellido as nombre FROM Profesores")
    columns = [column[0] for column in cursor.description]
    res = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(res)

@bp.route('/api/grados')
@login_required
def api_grados():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT GradoID as id, Nombre as nombre FROM Grados")
    columns = [column[0] for column in cursor.description]
    res = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(res)

@bp.route('/api/estudiantes')
@login_required
def api_estudiantes():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT EstudianteID as id, Nombre + ' ' + Apellido as nombre FROM Estudiantes WHERE EstadoID=2")
    columns = [column[0] for column in cursor.description]
    res = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(res)

@bp.route('/api/materias')
@login_required
def api_materias():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT MateriaID as id, Nombre as nombre FROM Materias")
    columns = [column[0] for column in cursor.description]
    res = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(res)

@bp.route('/api/periodos')
@login_required
def api_periodos():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT PeriodoID as id, Nombre as nombre FROM Periodos WHERE EstadoID=2")
    columns = [column[0] for column in cursor.description]
    res = [dict(zip(columns, row)) for row in cursor.fetchall()]
    conn.close()
    return jsonify(res)
