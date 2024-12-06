from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from model import db, Notification, UserCameras, User
from sqlalchemy import select, desc
import json


notifications_bp = Blueprint('notifications', __name__)
bcrypt = Bcrypt()

@notifications_bp.route('/database', methods=['POST'])
def database(): 
    device_id = request.get_json().get("device_id")
    timestamp = request.get_json().get("timestamp")
    message = request.get_json().get("message")
    notification = Notification()
    notification.device_id = device_id
    notification.timestamp = timestamp
    notification.message = message
    db.session.add(notification)
    db.session.commit()
    return '', 200
    
@notifications_bp.route('/notifications')
def notifications():
    user_id = session.get("user_id")
    query = select(
        Notification.timestamp, Notification.message, Notification.device_id
    ).select_from(UserCameras).join(
            Notification, UserCameras.device_id==Notification.device_id
    ).filter(
        UserCameras.user_id == user_id
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
