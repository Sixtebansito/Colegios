from flask import Blueprint, render_template
from utils import get_db_connection

bp = Blueprint('public', __name__)

@bp.route('/')
def index():
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM VW_CuposDisponibles")
        columns = [column[0] for column in cursor.description]
        cupos = [dict(zip(columns, row)) for row in cursor.fetchall()]
    except Exception as e:
        print(f"Error fetching cupos: {e}")
        cupos = []
    finally:
        if conn:
            conn.close()
            
    return render_template('public/index.html', cupos=cupos)
