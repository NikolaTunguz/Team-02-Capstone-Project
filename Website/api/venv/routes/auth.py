from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from model import db, User

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth_bp.route('/@me')
def get_cur_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id": user.id,
        "email": user.email
    })

@auth_bp.route('/register', methods=["POST"])
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

@auth_bp.route('/login', methods=["POST"])
def login_user():
    email = request.get_json().get("email")
    password = request.get_json().get("password").encode('utf8')
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401
    session["user_id"] = user.id
    return jsonify({
        "id": user.id,
        "email": user.email
    })  

@auth_bp.route('/update_email', methods=['POST'])
def update_email():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    new_email = request.get_json().get("email")

    user = User.query.get(user_id)
    user.email = new_email
    db.session.commit()
    return jsonify({
        "email": user.email
    })

@auth_bp.route('/update_password', methods=['POST'])
def update_password():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    current_password = request.get_json().get("current_password")
    new_password = request.get_json().get("new_password")

    user = User.query.get(user_id)
    if not bcrypt.check_password_hash(user.password, current_password):
        return jsonify({"error": "Current password is incorrect"}), 403

    user.password = bcrypt.generate_password_hash(new_password).decode('utf8')
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200