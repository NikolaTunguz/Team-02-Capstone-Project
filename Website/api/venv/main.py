from flask_cors import CORS
from flask import Flask
from config import ApplicationConfig
from model import db
from routes.auth import auth_bp
from routes.emergency_contact import emergency_contact_bp
from routes.cameras import camera_bp
from routes.notifications import notifications_bp
from routes.manage_users import manage_users_bp

app = Flask(__name__)
cors = CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
app.config.from_object(ApplicationConfig)
app.register_blueprint(auth_bp)
app.register_blueprint(emergency_contact_bp)
app.register_blueprint(camera_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(manage_users_bp)

db.init_app(app)
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(debug=True, port=8080)