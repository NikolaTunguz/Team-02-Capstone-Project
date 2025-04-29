from flask import Blueprint, request, jsonify, session, Response, stream_with_context, send_file
from flask_bcrypt import Bcrypt
from model import db, Notification, UserCameras, User, UserNotificationSettings
from sqlalchemy import select, desc
from .notify_contacts import notify_emergency_contacts, notify_user
import json
import time
from io import BytesIO

notifications_bp = Blueprint('notifications', __name__)
bcrypt = Bcrypt()
subscribers = []

@notifications_bp.route('/database', methods=['POST'])
def database(): 
    device_id = request.form.get("device_id")
    timestamp = request.form.get("timestamp")
    message = request.form.get("message")
    notif_type = request.form.get("notif_type")

    user_camera = UserCameras.query.filter_by(device_id=device_id).first()
    if not user_camera:
        print("device")
        return jsonify({"error": "Device not found"}), 404
    user_camera_name = user_camera.device_name
    user_id = user_camera.user_id 
    user = User.query.filter_by(id=user_id).first()

    settings = UserNotificationSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        print("404")
        return jsonify({"error": "Notification settings not found"}), 404

    should_notify = (
        (notif_type == "pistol" and settings.notify_pistol) or
        (notif_type == "person" and settings.notify_person) or
        (notif_type == "package" and settings.notify_package) or
        (notif_type == "fire" and settings.notify_fire)
    )

    notification = Notification()
    notification.device_id = device_id
    notification.timestamp = timestamp
    notification.message = message
    notification.notif_type = notif_type
    file = request.files.get("snapshot")
    if not file:
        return jsonify({"error": "No image provided"}), 400
    image_data = file.read()
    notification.snapshot = image_data

    db.session.add(notification)
    db.session.commit()
    if should_notify:
        notify_user(user, notification, user_camera_name)
    notify_emergency_contacts(user_id, notification, user_camera_name)
    notify_subscribers(json.dumps({
        "message": message,
        "timestamp": timestamp,
        "device_id": device_id
    }))

    return '', 200

@notifications_bp.route('/subscribe')
def subscribe():
    def event_stream():
        messages = []
        subscribers.append(messages)
        try:
            while True:
                if messages:
                    msg = messages.pop(0)
                    yield f'data: {msg}\n\n'
                time.sleep(1)
        except GeneratorExit:
            subscribers.remove(messages)

    return Response(stream_with_context(event_stream()), mimetype='text/event-stream')

def notify_subscribers(message):
    for sub in subscribers:
        sub.append(message)
    
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
        {"timestamp": str(notification[0]), "message": notification[1], "device_id": notification[2], }
        for notification in notifications
    ]

    return json.dumps(notifications, default=str)

@notifications_bp.route("/get_notification", methods=["GET"])
def get_snapshot():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    device_id = request.args.get("device_id", type=int)
    timestamp = request.args.get("timestamp")

    notif = Notification.query.filter_by(device_id=device_id, timestamp=timestamp).first()

    if not notif or not notif.snapshot:
        return jsonify({"error": "Notif snapshot not found"}), 404

    return send_file(BytesIO(notif.snapshot), mimetype='image/jpeg')

@notifications_bp.route('/remove_notification', methods=["POST"])
def remove_notification():
    device_id = request.get_json().get("device_id")
    timestamp = request.get_json().get("timestamp")

    notification = Notification.query.filter_by(device_id=device_id, timestamp=timestamp).first()
    print(notification)
    db.session.delete(notification)
    db.session.commit()
    return '', 200

# @notifications_bp.route('/mock_notification', methods=['POST'])
# def mock_notification():

#     user_id = session.get("user_id")
#     if not user_id:
#         return jsonify({"error": "Unauthorized"}), 401

#     device_id = request.get_json().get("device_id")
#     message = request.get_json().get("message")
#     timestamp = "2024-01-01T00:00:00Z"

#     notification = Notification(device_id=device_id, message=message, timestamp=timestamp)
#     notify_emergency_contacts(user_id, notification)

#     return jsonify({"message": "Mock notification generated and email sent"}), 200

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



