from flask_cors import CORS
from flask import Flask
from config import ApplicationConfig
from model import db
from routes.auth import auth_bp
from routes.emergency_contact import emergency_contact_bp
from routes.cameras import camera_bp
from routes.notifications import notifications_bp
from routes.manage_users import manage_users_bp
from model import User
from uuid import uuid4
from flask_bcrypt import Bcrypt

bcrypt = Bcrypt()
app = Flask(__name__)
cors = CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
app.config.from_object(ApplicationConfig)
app.register_blueprint(auth_bp)
app.register_blueprint(emergency_contact_bp)
app.register_blueprint(camera_bp)
app.register_blueprint(notifications_bp)
app.register_blueprint(manage_users_bp)

def create_admin_user():
    with app.app_context():
        if not User.query.filter_by(email="admin@admin").first():
            admin = User(
                id=uuid4().hex, 
                phone_number="0000000000",
                first_name="Admin",
                last_name="Admin",
                email="admin@admin",
                password=bcrypt.generate_password_hash("Password123").decode("utf-8"), 
                account_type="admin"
            )
            db.session.add(admin)
            db.session.commit()
            print("Admin user created successfully.")

db.init_app(app)
with app.app_context():
    db.create_all()
    create_admin_user()

if __name__ == "__main__":
    app.run(debug=True, port=8080)