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
                "phone": user.phone_number
            }
            for user in users
        ]
        return jsonify({"users": user_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
