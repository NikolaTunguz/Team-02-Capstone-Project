from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from model import db, Notification, UserCameras, User
from sqlalchemy import select, desc
from .notify_contacts import notify_emergency_contacts, notify_user
import json


notifications_bp = Blueprint('notifications', __name__)
bcrypt = Bcrypt()

@notifications_bp.route('/database', methods=['POST'])
def database(): 
    device_id = request.get_json().get("device_id")
    user_camera = UserCameras.query.filter_by(device_id=device_id).first()
    if not user_camera:
        return jsonify({"error": "Device not found"}), 404
    user_camera_name = user_camera.device_name
    user_id = user_camera.user_id 
    user = User.query.filter_by(id=user_id).first()
    timestamp = request.get_json().get("timestamp")
    message = request.get_json().get("message")
    notification = Notification()
    notification.device_id = device_id
    notification.timestamp = timestamp
    notification.message = message
    db.session.add(notification)
    db.session.commit()
    notify_emergency_contacts(user_id, notification, user_camera_name)
    notify_user(user, notification, user_camera_name)
    return '', 200
    
@notifications_bp.route('/notifications')
def notifications():
    user_id = session.get("user_id")
    query = select(
        Notification.timestamp, Notification.message, Notification.device_id
    ).select_from(UserCameras).join(
            Notification, UserCameras.device_id==Notification.device_id
    ).filter(
        UserCameras.user_id == user_id,
        Notification.read == False
    ).order_by(
        desc(Notification.timestamp)
    )

    notifications = db.session.execute(query).all()

    notifications = [
        {"timestamp": str(notification[0]), "message": notification[1], "device_id": notification[2]}
        for notification in notifications
    ]

    return json.dumps(notifications, default=str)

@notifications_bp.route('/remove_notification', methods=["POST"])
def remove_notification():
    device_id = request.get_json().get("device_id")
    timestamp = request.get_json().get("timestamp")

    notification = Notification.query.filter_by(device_id=device_id, timestamp=timestamp).first()
    print(notification)
    db.session.delete(notification)
    db.session.commit()
    return '', 200

@notifications_bp.route('/mock_notification', methods=['POST'])
def mock_notification():

    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    device_id = request.get_json().get("device_id")
    message = request.get_json().get("message")
    timestamp = "2024-01-01T00:00:00Z"

    notification = Notification(device_id=device_id, message=message, timestamp=timestamp)
    notify_emergency_contacts(user_id, notification)

    return jsonify({"message": "Mock notification generated and email sent"}), 200

@notifications_bp.route('/mark_read', methods=['POST'])
def mark_read():
    device_id = request.get_json().get("device_id")
    timestamp = request.get_json().get("timestamp")

    notification = Notification.query.filter_by(device_id=device_id, timestamp=timestamp).first()
    if notification:
        notification.read = True
        db.session.commit()
        return '', 200
    else:
        return jsonify({"error": "Notification not found"}), 404
    
@notifications_bp.route('/mark_unread', methods=['POST'])
def mark_unread():
    device_id = request.get_json().get("device_id")
    timestamp = request.get_json().get("timestamp")

    notification = Notification.query.filter_by(device_id=device_id, timestamp=timestamp).first()
    if notification:
        notification.read = False
        db.session.commit()
        return '', 200
    else:
        return jsonify({"error": "Notification not found"}), 404

@notifications_bp.route('/mark_all_read', methods=['POST'])
def mark_all_read():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    notifications = db.session.query(Notification).select_from(UserCameras).join(
    Notification, UserCameras.device_id == Notification.device_id).filter(
    UserCameras.user_id == user_id, Notification.read == False).all()

    for notification in notifications:
        notification.read = True
    
    db.session.commit()
    return '', 200

@notifications_bp.route('/delete_all_read', methods=['POST'])
def delete_all_read():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    notifications = db.session.query(Notification).select_from(UserCameras).join(
    Notification, UserCameras.device_id == Notification.device_id).filter(
    UserCameras.user_id == user_id, Notification.read == True).all()

    for notification in notifications:
        db.session.delete(notification)
        
    db.session.commit()
    return '', 200
        

@notifications_bp.route('/read-notifications')
def read_notifications():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    
    query = select(
        Notification.timestamp, Notification.message, Notification.device_id
    ).select_from(UserCameras).join(
            Notification, UserCameras.device_id==Notification.device_id
    ).filter(
        UserCameras.user_id == user_id,
        Notification.read == True
    ).order_by(
        desc(Notification.timestamp)
    )

    notifications = db.session.execute(query).all()

    notifications = [
        {"timestamp": str(notification[0]), "message": notification[1], "device_id": notification[2]}
        for notification in notifications
    ]

    return json.dumps(notifications, default=str)



