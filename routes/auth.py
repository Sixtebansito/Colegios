from flask import Blueprint, render_template, request, session, redirect, url_for, flash
from werkzeug.security import check_password_hash
from utils import get_db_connection

bp = Blueprint('auth', __name__)

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        if 'user_id' in session:
            # Already logged in, redirect
            if session['role_id'] == 1: return redirect(url_for('admin.dashboard'))
            elif session['role_id'] == 2: return redirect(url_for('profesor.dashboard'))
            elif session['role_id'] == 3: return redirect(url_for('padre.dashboard'))
        return render_template('login.html')
    
    cedula = request.form.get('cedula', '').strip()
    password = request.form.get('password', '').strip()
    
    if not cedula or not password:
        flash('Ingrese cédula y contraseña', 'error')
        return render_template('login.html')
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.UsuarioID, u.Cedula, u.PasswordHash, u.RoleID, r.Nombre as RolNombre
            FROM Usuarios u JOIN Roles r ON u.RoleID = r.RoleID
            WHERE u.Cedula = ? AND u.EstadoID = 2
        """, cedula)
        user = cursor.fetchone()
        
        if user and check_password_hash(user.PasswordHash, password):
            session['user_id'] = user.UsuarioID
            session['role_id'] = user.RoleID
            session['role'] = user.RolNombre
            session['cedula'] = user.Cedula
            
            if user.RoleID == 1:  # Admin
                session['nombre'] = 'Administrador'
                conn.close()
                return redirect(url_for('admin.dashboard'))
            elif user.RoleID == 2:  # Profesor
                cursor.execute("SELECT ProfesorID, Nombre, Apellido FROM Profesores WHERE UsuarioID = ?", user.UsuarioID)
                prof = cursor.fetchone()
                session['nombre'] = f"{prof.Nombre} {prof.Apellido}"
                session['profesor_id'] = prof.ProfesorID
                conn.close()
                return redirect(url_for('profesor.dashboard'))
            elif user.RoleID == 3:  # Padre
                cursor.execute("SELECT PadreID, Nombre, Apellido FROM Padres WHERE UsuarioID = ?", user.UsuarioID)
                pad = cursor.fetchone()
                session['nombre'] = f"{pad.Nombre} {pad.Apellido}"
                session['padre_id'] = pad.PadreID
                conn.close()
                return redirect(url_for('padre.dashboard'))
        else:
            conn.close()
            flash('Cédula o contraseña incorrecta', 'error')
            return render_template('login.html')
    except Exception as e:
        flash(f'Error de conexión: {str(e)}', 'error')
        return render_template('login.html')

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('auth.login'))
