from flask import Blueprint, jsonify, request, session
from model import User, db

manage_users_bp = Blueprint('manage_users_bp', __name__)

@manage_users_bp.route('/get_users', methods=['GET'])
def get_users(): 
    user_id = session.get("user_id") 
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_type = User.query.filter_by(id=user_id).first().account_type
    if not user_type == "admin": 
        return jsonify({"error": "Unauthorized"}), 401
    
    try:
        users = User.query.all()
        if not users:
            return jsonify({"message": "No emergency contacts found"}), 204
        
        user_list = [
            {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "phone": user.phone_number,
                "account_type": user.account_type
            }
            for user in users
        ]
        return jsonify({"users": user_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@manage_users_bp.route('/update_user', methods=['PUT'])
def update_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    user_type = User.query.filter_by(id=user_id).first().account_type
    if not user_type == "admin": 
        return jsonify({"error": "Unauthorized"}), 401
    
    previous_email = request.get_json().get("previous_email")
    first_name = request.get_json().get("first_name")
    last_name = request.get_json().get("last_name")
    email = request.get_json().get("email")
    phone = request.get_json().get('phone_number') #changed this from 'phone' to 'phone_number'
    account_type = request.get_json().get('account_type')
    user = User.query.filter_by(email=previous_email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    #print('\n\n\n', phone, '\n\n\n') #this was printing none until the line above was changed
    user.phone_number = str(phone) #changed this line from user.phone to user.phone_number
    user.account_type = account_type
    db.session.commit()
    return jsonify({"message": "User successfully updated"}), 200

@manage_users_bp.route('/delete_user', methods=['POST'])
def delete_user():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    user_type = User.query.filter_by(id=user_id).first().account_type
    if not user_type == "admin": 
        return jsonify({"error": "Unauthorized"}), 401
    
    email = request.get_json().get("email")
    contact = User.query.filter_by(email=email).first()
    if not contact:
        return jsonify({"error": "User not found"}), 404
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": " User successfully deleted"}), 200