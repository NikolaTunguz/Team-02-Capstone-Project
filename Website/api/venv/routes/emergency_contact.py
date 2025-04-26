from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from model import db, EmergencyContact

emergency_contact_bp = Blueprint('emergency_contact', __name__)
bcrypt = Bcrypt()

@emergency_contact_bp.route('/create_emergency_contact', methods=["POST"])
def create_emergency_contact():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    first_name = request.get_json().get("first_name")
    last_name = request.get_json().get("last_name")
    email = request.get_json().get("email")
    phone = request.get_json().get("phone")
    notify_pistol = request.get_json().get("notify_pistol", False)
    notify_package = request.get_json().get("notify_package", False)
    notify_person = request.get_json().get("notify_person", False)
    notify_fire = request.get_json().get("notify_fire", False)

    exists = EmergencyContact.query.filter(
            (EmergencyContact.email == email) 
            & (EmergencyContact.user_id == user_id)).first() is not None
    if exists:
        return jsonify({"error": "Emergency contact already exists"}), 409
    new_contact = EmergencyContact(first_name=first_name, 
        last_name = last_name,
        email=email, 
        phone=phone, 
        user_id=user_id,
        notify_pistol=notify_pistol,
        notify_package=notify_package,
        notify_person=notify_person,
        notify_fire=notify_fire
    )
    db.session.add(new_contact)
    db.session.commit()
    return jsonify({"message": "Emergency contact successfully added"}), 200

@emergency_contact_bp.route('/update_emergency_contact', methods=['PUT'])
def update_emergency_contact():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    previous_email = request.get_json().get("previous_email")
    first_name = request.get_json().get("first_name")
    last_name = request.get_json().get("last_name")
    email = request.get_json().get("email")
    phone = request.get_json().get("phone")
    notify_pistol = request.get_json().get("notify_pistol", False)
    notify_package = request.get_json().get("notify_package", False)
    notify_person = request.get_json().get("notify_person", False)
    notify_fire = request.get_json().get("notify_fire", False)
    contact = EmergencyContact.query.filter_by(user_id=user_id, email=previous_email).first()
    if not contact:
        return jsonify({"error": "Contact not found"}), 404

    contact.first_name = first_name
    contact.last_name = last_name
    contact.email = email
    contact.phone = phone
    contact.notify_pistol = notify_pistol
    contact.notify_package = notify_package
    contact.notify_person = notify_person
    contact.notify_fire = notify_fire
    db.session.commit()
    return jsonify({"message": "Emergency contact successfully updated"}), 200

@emergency_contact_bp.route('/delete_emergency_contact', methods=["POST"])
def delete_emergency_contact():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    email = request.get_json().get("email")
    contact = EmergencyContact.query.filter_by(user_id=user_id, email=email).first()
    if not contact:
        return jsonify({"error": "Contact not found"}), 404
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "Emergency contact successfully deleted"}), 200
  
@emergency_contact_bp.route('/get_emergency_contacts')
def get_emergency_contacts():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
        if not contacts:
            return jsonify({"message": "No emergency contacts found"}), 204
        contact_list = [
            {
                "first_name": contact.first_name,
                "last_name": contact.last_name,
                "email": contact.email,
                "phone": contact.phone,
                "notify_pistol": contact.notify_pistol,
                "notify_package": contact.notify_package,
                "notify_person": contact.notify_person,
                "notify_fire": contact.notify_fire
            }
            for contact in contacts
        ]
        return jsonify({"contacts": contact_list}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
