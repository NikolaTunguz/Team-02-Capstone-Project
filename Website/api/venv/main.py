from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_session import Session
from flask import Flask, send_from_directory
from config import ApplicationConfig
from model import db, User


app = Flask(__name__)
cors = CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

app.config.from_object(ApplicationConfig)
db.init_app(app)
with app.app_context():
    db.create_all()

bcrypt = Bcrypt(app)
session = Session(app)

@app.route('/@me')
def get_cur_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "email": user.email
    })

@app.route('/register', methods=["POST"])
def register_user():
    email = request.get_json().get("email")
    password = request.get_json().get("password")
    exists = User.query.filter_by(email=email).first() is not None
    if exists:
        return jsonify({"error": "User already exists"}), 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf8')
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({
        "id": new_user.id,
        "email": new_user.email
    })

@app.route('/login', methods=["POST"])
def login_user():
    email = request.get_json().get("email")
    password = request.get_json().get("password").encode('utf8')
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401
    # if user and user.user.id:
    #     session["user_id"] = user.user.id
    return jsonify({
        "id": user.id,
        "email": user.email
    })  

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