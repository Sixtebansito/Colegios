from flask import Blueprint, render_template, request, jsonify, session
from utils import get_db_connection, login_required, role_required

bp = Blueprint('profesor', __name__)

@bp.route('/')
@login_required
@role_required(2)
def dashboard():
    conn = None
    materias_count = 0
    notas_count = 0
    pendientes_count = 0
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get professor ID
        profesor_id = session.get('profesor_id')
        if not profesor_id:
            cursor.execute("SELECT ProfesorID FROM Profesores WHERE UsuarioID = ?", session.get('user_id'))
            p = cursor.fetchone()
            if p:
                profesor_id = p.ProfesorID
                session['profesor_id'] = profesor_id
                
        # Get materias count
        cursor.execute("SELECT COUNT(*) as total FROM Materias WHERE ProfesorID = ?", profesor_id)
        res = cursor.fetchone()
        materias_count = res.total if res else 0
        
        # Get notas count
        cursor.execute("SELECT COUNT(*) as total FROM Notas WHERE ProfesorID = ?", profesor_id)
        res = cursor.fetchone()
        notas_count = res.total if res else 0
        
        # Get solicitudes count
        cursor.execute("""
            SELECT COUNT(*) as total 
            FROM SolicitudesRecalificacion s
            JOIN Notas n ON s.NotaID = n.NotaID
            WHERE n.ProfesorID = ? AND s.Estado = 'Pendiente'
        """, profesor_id)
        res = cursor.fetchone()
        pendientes_count = res.total if res else 0
                
    except Exception as e:
        print(f"Error in dashboard: {e}")
    finally:
        if conn:
            conn.close()
            
    return render_template('profesor/dashboard.html', materias_count=materias_count, notas_count=notas_count, pendientes_count=pendientes_count)

@bp.route('/notas')
@login_required
@role_required(2)
def notas():
    return render_template('profesor/notas.html')

@bp.route('/api/actividades', methods=['GET'])
@login_required
@role_required(2)
def get_actividades():
    materia_id = request.args.get('materia_id')
    periodo_id = request.args.get('periodo_id')
    if not materia_id or not periodo_id:
        return jsonify([])
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT ActividadID, Nombre, Porcentaje 
        FROM Actividades 
        WHERE MateriaID = ? AND PeriodoID = ?
        ORDER BY FechaCreacion ASC
    """, materia_id, periodo_id)
    cols = [c[0] for c in cursor.description]
    res = [dict(zip(cols, row)) for row in cursor.fetchall()]
    conn.close()
    for row in res:
        row['Porcentaje'] = float(row['Porcentaje'])
    return jsonify(res)

@bp.route('/api/actividades', methods=['POST'])
@login_required
@role_required(2)
def create_actividad():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO Actividades (MateriaID, PeriodoID, Nombre, Porcentaje)
            OUTPUT INSERTED.ActividadID
            VALUES (?, ?, ?, ?)
        """, data['materia_id'], data['periodo_id'], data['nombre'], data['porcentaje'])
        actividad_id = cursor.fetchone()[0]
        conn.commit()
        return jsonify({'success': True, 'actividad_id': actividad_id, 'message': 'Actividad creada'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/api/actividades/<int:id>', methods=['PUT'])
@login_required
@role_required(2)
def update_actividad(id):
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("UPDATE Actividades SET Nombre = ?, Porcentaje = ? WHERE ActividadID = ?", 
                       data['nombre'], data['porcentaje'], id)
        conn.commit()
        return jsonify({'success': True, 'message': 'Actividad actualizada'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/api/actividades/<int:id>', methods=['DELETE'])
@login_required
@role_required(2)
def delete_actividad(id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM NotasActividades WHERE ActividadID = ?", id)
        cursor.execute("DELETE FROM Actividades WHERE ActividadID = ?", id)
        conn.commit()
        return jsonify({'success': True, 'message': 'Actividad eliminada'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/api/estudiantes_notas', methods=['GET'])
@login_required
@role_required(2)
def get_estudiantes_notas():
    materia_id = request.args.get('materia_id')
    periodo_id = request.args.get('periodo_id')
    if not materia_id or not periodo_id:
        return jsonify([])
        
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Obtener estudiantes de la materia
        cursor.execute("SELECT GradoID FROM Materias WHERE MateriaID = ?", materia_id)
        grado_row = cursor.fetchone()
        if not grado_row: return jsonify([])
        
        cursor.execute("""
            SELECT e.EstudianteID, e.Nombre, e.Apellido 
            FROM Estudiantes e
            JOIN Matriculas m ON e.EstudianteID = m.EstudianteID
            WHERE m.GradoID = ? AND m.Estado = 'Activa'
            ORDER BY e.Apellido, e.Nombre
        """, grado_row.GradoID)
        cols = [c[0] for c in cursor.description]
        estudiantes = [dict(zip(cols, row)) for row in cursor.fetchall()]
        
        # Obtener actividades
        cursor.execute("SELECT ActividadID, Porcentaje FROM Actividades WHERE MateriaID = ? AND PeriodoID = ?", materia_id, periodo_id)
        actividades = cursor.fetchall()
        act_map = {a.ActividadID: float(a.Porcentaje) for a in actividades}
        
        # Obtener notas
        if actividades:
            act_ids = [str(a.ActividadID) for a in actividades]
            placeholders = ','.join('?' * len(act_ids))
            cursor.execute(f"SELECT ActividadID, EstudianteID, Nota FROM NotasActividades WHERE ActividadID IN ({placeholders})", act_ids)
            notas = cursor.fetchall()
        else:
            notas = []
            
        notas_dict = {}
        for n in notas:
            if n.EstudianteID not in notas_dict:
                notas_dict[n.EstudianteID] = {}
            notas_dict[n.EstudianteID][n.ActividadID] = float(n.Nota)
            
        # Preparar resultado
        for est in estudiantes:
            est['notas'] = notas_dict.get(est['EstudianteID'], {})
            promedio = 0
            for act_id, nota in est['notas'].items():
                promedio += nota * (act_map.get(act_id, 0) / 100.0)
            est['promedio'] = round(promedio, 2)
            
        return jsonify(estudiantes)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn: conn.close()

@bp.route('/api/notas_actividades', methods=['POST'])
@login_required
@role_required(2)
def save_nota_actividad():
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Guardar nota de actividad
        cursor.execute("SELECT NotaActividadID FROM NotasActividades WHERE ActividadID = ? AND EstudianteID = ?", data['actividad_id'], data['estudiante_id'])
        if cursor.fetchone():
            cursor.execute("UPDATE NotasActividades SET Nota = ? WHERE ActividadID = ? AND EstudianteID = ?", data['nota'], data['actividad_id'], data['estudiante_id'])
        else:
            cursor.execute("INSERT INTO NotasActividades (ActividadID, EstudianteID, Nota) VALUES (?, ?, ?)", data['actividad_id'], data['estudiante_id'], data['nota'])
            
        # Recalcular promedio de la materia
        # 1. Obtener todas las actividades de esta materia/periodo
        cursor.execute("SELECT MateriaID, PeriodoID FROM Actividades WHERE ActividadID = ?", data['actividad_id'])
        act = cursor.fetchone()
        
        cursor.execute("SELECT ActividadID, Porcentaje FROM Actividades WHERE MateriaID = ? AND PeriodoID = ?", act.MateriaID, act.PeriodoID)
        acts = cursor.fetchall()
        act_ids = [str(a.ActividadID) for a in acts]
        
        promedio = 0
        if act_ids:
            placeholders = ','.join('?' * len(act_ids))
            cursor.execute(f"SELECT ActividadID, Nota FROM NotasActividades WHERE EstudianteID = ? AND ActividadID IN ({placeholders})", data['estudiante_id'], act_ids)
            notas_est = cursor.fetchall()
            
            act_map = {a.ActividadID: float(a.Porcentaje) for a in acts}
            for n in notas_est:
                promedio += float(n.Nota) * (act_map.get(n.ActividadID, 0) / 100.0)
                
            promedio = round(promedio, 2)
            
            # Guardar en tabla Notas global
            cursor.execute("SELECT NotaID FROM Notas WHERE EstudianteID = ? AND MateriaID = ? AND PeriodoID = ?", data['estudiante_id'], act.MateriaID, act.PeriodoID)
            if cursor.fetchone():
                cursor.execute("UPDATE Notas SET Nota = ?, FechaRegistro = GETDATE() WHERE EstudianteID = ? AND MateriaID = ? AND PeriodoID = ?", promedio, data['estudiante_id'], act.MateriaID, act.PeriodoID)
            else:
                cursor.execute("INSERT INTO Notas (EstudianteID, MateriaID, PeriodoID, ProfesorID, Nota) VALUES (?, ?, ?, ?, ?)", data['estudiante_id'], act.MateriaID, act.PeriodoID, session.get('profesor_id'), promedio)
                
        conn.commit()
        return jsonify({'success': True, 'promedio': promedio})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn: conn.close()

@bp.route('/recalificaciones')
@login_required
@role_required(2)
def recalificaciones():
    conn = None
    results = []
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT sr.*, m.Nombre as NombreMateria, 
                   (e.Nombre + ' ' + e.Apellido) as NombreEstudiante,
                   p.Nombre as PeriodoNombre, n.Nota as NotaActual
            FROM SolicitudesRecalificacion sr
            JOIN Notas n ON sr.NotaID = n.NotaID
            JOIN Materias m ON n.MateriaID = m.MateriaID
            JOIN Estudiantes e ON n.EstudianteID = e.EstudianteID
            JOIN Periodos p ON n.PeriodoID = p.PeriodoID
            WHERE n.ProfesorID = ?
            ORDER BY CASE WHEN sr.Estado = 'Pendiente' THEN 0 ELSE 1 END, sr.FechaSolicitud DESC
        """, session.get('profesor_id'))
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        for row in results:
            if row.get('FechaSolicitud'):
                row['FechaSolicitud'] = row['FechaSolicitud'].strftime('%Y-%m-%d %H:%M')
            if row.get('FechaResolucion'):
                row['FechaResolucion'] = row['FechaResolucion'].strftime('%Y-%m-%d %H:%M')
            if row.get('NotaAnterior') is not None:
                row['NotaAnterior'] = float(row['NotaAnterior'])
            if row.get('NotaNueva') is not None:
                row['NotaNueva'] = float(row['NotaNueva'])
            if row.get('NotaActual') is not None:
                row['NotaActual'] = float(row['NotaActual'])
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
            
    return render_template('profesor/recalificaciones.html', recalificaciones=results)

@bp.route('/recalificaciones/<int:id>/resolver', methods=['POST'])
@login_required
@role_required(2)
def resolver_recalificacion(id):
    data = request.json
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify the recalification is for this profesor's grade
        cursor.execute("""
            SELECT sr.NotaID, n.Nota 
            FROM SolicitudesRecalificacion sr
            JOIN Notas n ON sr.NotaID = n.NotaID
            WHERE sr.SolicitudID = ? AND n.ProfesorID = ? AND sr.Estado = 'Pendiente'
        """, id, session.get('profesor_id'))
        
        row = cursor.fetchone()
        if not row:
            return jsonify({'success': False, 'message': 'Solicitud no encontrada o ya resuelta'})
            
        estado = data.get('estado')
        comentario = data.get('comentario_profesor', '')
        
        if estado == 'Aprobada':
            nueva_nota = data.get('nota_nueva')
            if nueva_nota is None:
                return jsonify({'success': False, 'message': 'Debe proveer una nueva nota para aprobar'})
                
            # Update the Nota table
            cursor.execute("UPDATE Notas SET Nota = ? WHERE NotaID = ?", nueva_nota, row.NotaID)
            
            # Update the Solicitud
            cursor.execute("""
                UPDATE SolicitudesRecalificacion 
                SET Estado = 'Aprobada', NotaNueva = ?, ComentarioProfesor = ?, FechaResolucion = GETDATE()
                WHERE SolicitudID = ?
            """, nueva_nota, comentario, id)
        elif estado == 'Rechazada':
            # Update the Solicitud
            cursor.execute("""
                UPDATE SolicitudesRecalificacion 
                SET Estado = 'Rechazada', ComentarioProfesor = ?, FechaResolucion = GETDATE()
                WHERE SolicitudID = ?
            """, comentario, id)
        else:
            return jsonify({'success': False, 'message': 'Estado inválido'})
            
        conn.commit()
        return jsonify({'success': True, 'message': f'Solicitud {estado.lower()} correctamente'})
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'success': False, 'message': f'Error al resolver solicitud: {str(e)}'})
    finally:
        if conn:
            conn.close()

@bp.route('/api/estudiantes')
@login_required
@role_required(2)
def api_estudiantes():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all active students (GradoID is NULL in materias for universal subjects)
        cursor.execute("""
            SELECT EstudianteID as id, Nombre + ' ' + Apellido as nombre
            FROM Estudiantes
            WHERE EstadoID = 2
            ORDER BY Nombre, Apellido
        """)
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@bp.route('/api/materias')
@login_required
@role_required(2)
def api_materias():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT MateriaID as id, Nombre as nombre
            FROM Materias
            WHERE ProfesorID = ?
            ORDER BY nombre
        """, session.get('profesor_id'))
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@bp.route('/api/periodos')
@login_required
@role_required(2)
def api_periodos():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT PeriodoID as id, Nombre as nombre FROM Periodos WHERE EstadoID = 2 ORDER BY Nombre")
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

# ==========================================
# MENSAJERIA INTERNA
# ==========================================

@bp.route('/mensajes')
@login_required
@role_required(2)
def mensajes_view():
    return render_template('profesor/mensajes.html')

@bp.route('/api/mensajes/contactos')
@login_required
@role_required(2)
def api_mensajes_contactos():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Un profesor puede contactar a los padres de los alumnos que toman sus materias
        profesor_id = session.get('profesor_id')
        cursor.execute("""
            SELECT DISTINCT p.PadreID, p.Nombre, p.Apellido
            FROM Padres p
            JOIN Estudiantes e ON p.PadreID = e.PadreID
            JOIN Matriculas mat ON e.EstudianteID = mat.EstudianteID
            JOIN Materias m ON mat.GradoID = m.GradoID OR m.GradoID IS NULL
            WHERE m.ProfesorID = ? AND mat.Estado = 'Activa'
        """, profesor_id)
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@bp.route('/api/mensajes/<int:padre_id>')
@login_required
@role_required(2)
def api_mensajes_historial(padre_id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        profesor_id = session.get('profesor_id')
        cursor.execute("""
            SELECT MensajeID, Remitente, Contenido, FechaEnvio, Leido
            FROM Mensajes
            WHERE ProfesorID = ? AND PadreID = ?
            ORDER BY FechaEnvio ASC
        """, profesor_id, padre_id)
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Marcar como leidos los mensajes enviados por el padre
        cursor.execute("""
            UPDATE Mensajes SET Leido = 1 
            WHERE ProfesorID = ? AND PadreID = ? AND Remitente = 'Padre' AND Leido = 0
        """, profesor_id, padre_id)
        conn.commit()
        
        return jsonify(results)
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@bp.route('/api/mensajes', methods=['POST'])
@login_required
@role_required(2)
def api_enviar_mensaje():
    conn = None
    try:
        data = request.json
        if not data or not data.get('padre_id') or not data.get('contenido'):
            return jsonify({'success': False, 'message': 'Faltan datos'})
            
        conn = get_db_connection()
        cursor = conn.cursor()
        profesor_id = session.get('profesor_id')
        
        cursor.execute("""
            INSERT INTO Mensajes (ProfesorID, PadreID, Remitente, Contenido)
            VALUES (?, ?, 'Profesor', ?)
        """, profesor_id, data['padre_id'], data['contenido'])
        conn.commit()
        
        return jsonify({'success': True, 'message': 'Mensaje enviado'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn:
            conn.close()
