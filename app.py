from flask import Flask, session, redirect, url_for
from config import Config
from routes import auth, public, admin, profesor, padre

app = Flask(__name__)
app.secret_key = Config.SECRET_KEY if hasattr(Config, 'SECRET_KEY') else 'super_secret_key_123'

app.register_blueprint(public.bp)
app.register_blueprint(auth.bp)
app.register_blueprint(admin.bp, url_prefix='/admin')
app.register_blueprint(profesor.bp, url_prefix='/profesor')
app.register_blueprint(padre.bp, url_prefix='/padre')

if __name__ == '__main__':
    app.run(debug=True, port=5005)
