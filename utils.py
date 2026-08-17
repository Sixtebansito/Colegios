import pyodbc
from config import Config
from functools import wraps
from flask import session, redirect, url_for, flash
import math

def get_db_connection():
    return pyodbc.connect(Config.get_connection_string())

def validar_cedula(cedula: str) -> bool:
    if len(cedula) != 10 or not cedula.isdigit():
        return False
    prov = int(cedula[:2])
    if prov < 1 or (prov > 24 and prov != 30):
        return False
    if int(cedula[2]) >= 6:
        return False
        
    coef = [2, 1, 2, 1, 2, 1, 2, 1, 2]
    suma = 0
    for i in range(9):
        val = int(cedula[i]) * coef[i]
        if val > 9:
            val -= 9
        suma += val
    
    decena_superior = math.ceil(suma / 10) * 10
    digito_verificador = decena_superior - suma
    if digito_verificador == 10:
        digito_verificador = 0
        
    return digito_verificador == int(cedula[9])

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('auth.login'))
        return f(*args, **kwargs)
    return decorated_function

def role_required(role_id):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if 'user_id' not in session:
                return redirect(url_for('auth.login'))
            if session.get('role_id') != role_id:
                flash('No tienes permiso para acceder a esta página', 'error')
                return redirect(url_for('public.index'))
            return f(*args, **kwargs)
        return decorated_function
    return decorator
