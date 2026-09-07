from flask import Flask, session, redirect, url_for
from flask_talisman import Talisman
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from config import Config
from routes import auth, public, admin, profesor, padre
import os

app = Flask(__name__)
if not Config.SECRET_KEY:
    raise ValueError("No FLASK_SECRET_KEY set for Flask application. Did you forget to set it?")
app.secret_key = Config.SECRET_KEY

# Secure session cookies
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
)

# Initialize Talisman (Security Headers)
# We disable CSP temporarily or make it permissive so it doesn't break existing inline scripts/styles immediately
Talisman(app, content_security_policy=None)

# Initialize Limiter (Rate Limiting)
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"],
    storage_uri="memory://"
)

app.register_blueprint(public.bp)
app.register_blueprint(auth.bp)
app.register_blueprint(admin.bp, url_prefix='/admin')
app.register_blueprint(profesor.bp, url_prefix='/profesor')
app.register_blueprint(padre.bp, url_prefix='/padre')

if __name__ == '__main__':
    # When running in production, use Gunicorn instead of this block.
    # This block is left just in case local testing is needed.
    app.run(host='0.0.0.0', port=5000)
