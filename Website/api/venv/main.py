from flask_cors import CORS
from flask import Flask
import argparse
from config import ApplicationConfig, TestConfig
from model import db
from routes.auth import auth_bp
from routes.emergency_contact import emergency_contact_bp
from routes.cameras import camera_bp
from routes.notifications import notifications_bp
from routes.manage_users import manage_users_bp

def setup(mode):
    app = Flask(__name__)
    cors = CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
    if mode == "dev":
        app.config.from_object(ApplicationConfig)
    elif mode == "test":
        app.config.from_object(TestConfig)
    app.register_blueprint(auth_bp)
    app.register_blueprint(emergency_contact_bp)
    app.register_blueprint(camera_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(manage_users_bp)

    db.init_app(app)
    with app.app_context():
        db.create_all()
    return app

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--app", default="dev")
    args = parser.parse_args()
    setup(args.app).run(debug=True, port=8080)