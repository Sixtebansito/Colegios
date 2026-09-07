from flask import Blueprint, render_template, request, jsonify, session
from utils import get_db_connection, login_required, role_required

bp = Blueprint('padre', __name__)

@bp.route('/')
@login_required
@role_required(3)
def dashboard():
    conn = None
    hijos = []
    stats = {'total_hijos': 0, 'promedio_general': 0}
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get padre ID
        padre_id = session.get('padre_id')
        if not padre_id:
            cursor.execute("SELECT PadreID FROM Padres WHERE UsuarioID = ?", session.get('user_id'))
            p = cursor.fetchone()
            if p:
                padre_id = p.PadreID
                session['padre_id'] = padre_id
                
        # Get children
        cursor.execute("SELECT * FROM VW_EstudiantesPorPadre WHERE PadreID = ?", padre_id)
        columns = [column[0] for column in cursor.description]
        hijos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        stats['total_hijos'] = len(hijos)
        
        # Get grades to calculate avg
        if hijos:
            for hijo in hijos:
                cursor.execute("SELECT AVG(Nota) as Promedio FROM VW_NotasCompletas WHERE EstudianteID = ?", hijo['EstudianteID'])
                res = cursor.fetchone()
                hijo['Promedio'] = float(res.Promedio) if res and res.Promedio is not None else None
                
            estudiante_ids = [str(h['EstudianteID']) for h in hijos]
            placeholders = ','.join('?' * len(estudiante_ids))
            cursor.execute(f"SELECT AVG(Nota) as Promedio FROM VW_NotasCompletas WHERE EstudianteID IN ({placeholders})", estudiante_ids)
            promedio = cursor.fetchone()
            if promedio and promedio.Promedio:
                stats['promedio_general'] = float(promedio.Promedio)
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
            
    return render_template('padre/dashboard.html', hijos=hijos, stats=stats)


@bp.route('/notas')
@login_required
@role_required(3)
def notas():
    conn = None
    hijos = []
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get padre ID
        padre_id = session.get('padre_id')
        
        # Get children
        cursor.execute("SELECT * FROM VW_EstudiantesPorPadre WHERE PadreID = ?", padre_id)
        columns = [column[0] for column in cursor.description]
        hijos = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # For each child, get their grades
        for hijo in hijos:
            cursor.execute("""
                SELECT n.*, 
                       CASE WHEN s.SolicitudID IS NOT NULL AND s.Estado = 'Pendiente' THEN 1 ELSE 0 END as TieneRecalificacionPendiente
                FROM VW_NotasCompletas n
                LEFT JOIN SolicitudesRecalificacion s ON n.NotaID = s.NotaID AND s.Estado = 'Pendiente'
                WHERE n.EstudianteID = ?
                ORDER BY n.NombrePeriodo, n.NombreMateria
            """, hijo['EstudianteID'])
            n_cols = [col[0] for col in cursor.description]
            hijo['notas'] = [dict(zip(n_cols, row)) for row in cursor.fetchall()]
            
    except Exception as e:
        print(f"Error getting notas: {e}")
    finally:
        if conn:
            conn.close()
            
    return render_template('padre/notas.html', hijos=hijos)


@bp.route('/notas/data')
@login_required
@role_required(3)
def notas_data():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Get all children's IDs
        cursor.execute("SELECT EstudianteID FROM Estudiantes WHERE PadreID = ?", session.get('padre_id'))
        hijos = cursor.fetchall()
        
        if not hijos:
            return jsonify([])
            
        estudiante_ids = [h[0] for h in hijos]
        placeholders = ','.join('?' * len(estudiante_ids))
        
        # Get grades
        query = f"SELECT * FROM VW_NotasCompletas WHERE EstudianteID IN ({placeholders})"
        cursor.execute(query, estudiante_ids)
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Format dates and decimals
        for row in results:
            if row.get('FechaRegistro'):
                row['FechaRegistro'] = row['FechaRegistro'].strftime('%Y-%m-%d %H:%M')
            if row.get('Nota') is not None:
                row['Nota'] = float(row['Nota'])
                
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()


@bp.route('/recalificacion', methods=['POST'])
@login_required
@role_required(3)
def request_recalificacion():
    data = request.json
    if not data or not data.get('nota_id') or not data.get('motivo'):
        return jsonify({'success': False, 'message': 'Faltan datos obligatorios'})
        
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Verify the nota belongs to one of their children
        cursor.execute("""
            SELECT n.NotaID, n.Nota 
            FROM Notas n
            JOIN Estudiantes e ON n.EstudianteID = e.EstudianteID
            WHERE n.NotaID = ? AND e.PadreID = ?
        """, data['nota_id'], session.get('padre_id'))
        
        nota = cursor.fetchone()
        
        if not nota:
            return jsonify({'success': False, 'message': 'Nota no encontrada o no pertenece a sus hijos'})
            
        # Check if a pending request already exists
        cursor.execute("""
            SELECT SolicitudID FROM SolicitudesRecalificacion 
            WHERE NotaID = ? AND Estado = 'Pendiente'
        """, data['nota_id'])
        
        if cursor.fetchone():
            return jsonify({'success': False, 'message': 'Ya existe una solicitud pendiente para esta nota'})
            
        # Create request
        cursor.execute("""
            INSERT INTO SolicitudesRecalificacion (NotaID, PadreID, Motivo, Estado, NotaAnterior)
            VALUES (?, ?, ?, 'Pendiente', ?)
        """, data['nota_id'], session.get('padre_id'), data['motivo'], nota.Nota)
        
        conn.commit()
        return jsonify({'success': True, 'message': 'Solicitud enviada correctamente'})
    except Exception as e:
        if conn:
            conn.rollback()
        return jsonify({'success': False, 'message': f'Error al enviar solicitud: {str(e)}'})
    finally:
        if conn:
            conn.close()


@bp.route('/recalificaciones')
@login_required
@role_required(3)
def recalificaciones():
    conn = None
    results = []
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT sr.*, m.Nombre as NombreMateria, 
                   (e.Nombre + ' ' + e.Apellido) as NombreEstudiante,
                   p.Nombre as PeriodoNombre
            FROM SolicitudesRecalificacion sr
            JOIN Notas n ON sr.NotaID = n.NotaID
            JOIN Materias m ON n.MateriaID = m.MateriaID
            JOIN Estudiantes e ON n.EstudianteID = e.EstudianteID
            JOIN Periodos p ON n.PeriodoID = p.PeriodoID
            WHERE sr.PadreID = ?
            ORDER BY sr.FechaSolicitud DESC
        """, session.get('padre_id'))
        
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
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if conn:
            conn.close()
            
    return render_template('padre/recalificaciones.html', recalificaciones=results)

# ==========================================
# MENSAJERIA INTERNA
# ==========================================

@bp.route('/mensajes')
@login_required
@role_required(3)
def mensajes_view():
    return render_template('padre/mensajes.html')

@bp.route('/api/mensajes/contactos')
@login_required
@role_required(3)
def api_mensajes_contactos():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Un padre puede contactar a los profesores de las materias de sus hijos
        padre_id = session.get('padre_id')
        cursor.execute("""
            SELECT DISTINCT p.ProfesorID, p.Nombre, p.Apellido, m.Nombre as Materia
            FROM Profesores p
            JOIN Materias m ON p.ProfesorID = m.ProfesorID
            JOIN Matriculas mat ON (mat.GradoID = m.GradoID OR m.GradoID IS NULL)
            JOIN Estudiantes e ON mat.EstudianteID = e.EstudianteID
            WHERE e.PadreID = ? AND mat.Estado = 'Activa'
        """, padre_id)
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return jsonify(results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if conn:
            conn.close()

@bp.route('/api/mensajes/<int:profesor_id>')
@login_required
@role_required(3)
def api_mensajes_historial(profesor_id):
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        padre_id = session.get('padre_id')
        cursor.execute("""
            SELECT MensajeID, Remitente, Contenido, FechaEnvio, Leido
            FROM Mensajes
            WHERE ProfesorID = ? AND PadreID = ?
            ORDER BY FechaEnvio ASC
        """, profesor_id, padre_id)
        
        columns = [column[0] for column in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        # Marcar como leidos los mensajes enviados por el profesor
        cursor.execute("""
            UPDATE Mensajes SET Leido = 1 
            WHERE ProfesorID = ? AND PadreID = ? AND Remitente = 'Profesor' AND Leido = 0
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
@role_required(3)
def api_enviar_mensaje():
    conn = None
    try:
        data = request.json
        if not data or not data.get('profesor_id') or not data.get('contenido'):
            return jsonify({'success': False, 'message': 'Faltan datos'})
            
        conn = get_db_connection()
        cursor = conn.cursor()
        padre_id = session.get('padre_id')
        
        cursor.execute("""
            INSERT INTO Mensajes (ProfesorID, PadreID, Remitente, Contenido)
            VALUES (?, ?, 'Padre', ?)
        """, data['profesor_id'], padre_id, data['contenido'])
        conn.commit()
        
        return jsonify({'success': True, 'message': 'Mensaje enviado'})
    except Exception as e:
        if conn: conn.rollback()
        return jsonify({'success': False, 'message': str(e)})
    finally:
        if conn:
            conn.close()
