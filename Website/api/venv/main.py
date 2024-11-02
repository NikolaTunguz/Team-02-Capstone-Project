from flask import Flask
from flask_cors import CORS
from flask import Flask, send_from_directory
from config import ApplicationConfig
from model import db
from routes.auth import auth_bp

app = Flask(__name__)
cors = CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
app.config.from_object(ApplicationConfig)
app.register_blueprint(auth_bp)

db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/account')
def account():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/notifications')
def notifications():
    return send_from_directory(app.static_folder, 'index.html')

with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=8080)