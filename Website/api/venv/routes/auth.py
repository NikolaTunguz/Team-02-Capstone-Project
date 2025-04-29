from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from model import db, User, UserNotificationSettings
from sqlalchemy import select
import json

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
    phone_number = request.get_json().get("phone_number")
    first_name = request.get_json().get("first_name")
    last_name = request.get_json().get("last_name")
    email = request.get_json().get("email")
    password = request.get_json().get("password")
    exists = User.query.filter_by(email=email).first() is not None
    if exists:
        return jsonify({"error": "User already exists"}), 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf8')
    new_user = User(phone_number=phone_number, first_name=first_name, last_name=last_name, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    session["user_id"] = new_user.id
    new_user_settings = UserNotificationSettings(user_id=new_user.id)
    db.session.add(new_user_settings)
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
        "email": user.email,
        "account_type": user.account_type
    })  

@auth_bp.route('/update_email', methods=['POST'])
def update_email():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    new_email = request.get_json().get("email")
    user = User.query.filter_by(email=new_email).first()
    if user: 
        return jsonify({"error": "User already exists"}), 409
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

@auth_bp.route('/logout', methods=["POST"])
def logout_user():
    session.pop("user_id", None)
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route('/update_first_name', methods=['POST'])
def update_first_name():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    new_first_name = request.get_json().get('first_name')
    user = User.query.filter_by(id=user_id).first()
    user.first_name = new_first_name
    db.session.commit()
    return jsonify({"message": "First name updated successfully"}), 200

@auth_bp.route('/update_last_name', methods=['POST'])
def update_last_name():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    new_last_name = request.get_json().get('last_name')
    user = User.query.filter_by(id=user_id).first()
    user.last_name = new_last_name
    db.session.commit()
    return jsonify({"message": "Last name updated successfully"}), 200

@auth_bp.route('/current_phone_number')
def current_phone_number():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = User.query.filter_by(id=user_id).first()
    current_phone_number = user.phone_number

    return jsonify({"phone_number":current_phone_number})

@auth_bp.route('/update_phone_number', methods=['POST'])
def update_phone_number():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    new_phone_number = request.get_json().get('phone_number')
    user = User.query.filter_by(id=user_id).first()
    user.phone_number = new_phone_number
    db.session.commit()
    return jsonify({"message": "Phone number updated successfully"}), 200

@auth_bp.route('/first_last')
def first_last():
    user_id = session.get("user_id")
    query = select(
        User.first_name,
        User.last_name
    ).filter(
        User.id == user_id
    )
    first_name, last_name = db.session.execute(query).all()[0]

    firstLast = {'first':first_name, 'last':last_name}
    return json.dumps(firstLast, default=str)
    