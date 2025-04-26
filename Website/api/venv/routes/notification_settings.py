from flask import Blueprint, request, jsonify, session
from model import db, User, UserNotificationSettings
import json

notification_settings_bp = Blueprint('notification_settings', __name__)

@notification_settings_bp.route("/notification_settings", methods=["GET"])
def get_notification_settings():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    settings = UserNotificationSettings.query.filter_by(user_id=user_id).first()
    if not settings:
        return jsonify({
            "notify_pistol": True,
            "notify_person": True,
            "notify_package": True,
            "notify_fire": True,
        }), 200 

    return jsonify({
        "notify_pistol": settings.notify_pistol,
        "notify_person": settings.notify_person,
        "notify_package": settings.notify_package,
        "notify_fire": settings.notify_fire,
    }), 200


@notification_settings_bp.route("/notification_settings", methods=["POST"])
def update_notification_settings():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    settings = UserNotificationSettings.query.filter_by(user_id=user_id).first()

    if not settings:
        settings = UserNotificationSettings(user_id=user_id)

    settings.notify_pistol = data.get("notify_pistol", settings.notify_pistol)
    settings.notify_person = data.get("notify_person", settings.notify_person)
    settings.notify_package = data.get("notify_package", settings.notify_package)
    settings.notify_fire = data.get("notify_fire", settings.notify_fire)

    db.session.add(settings)
    db.session.commit()

    return jsonify({"message": "Notification settings updated successfully"}), 200
