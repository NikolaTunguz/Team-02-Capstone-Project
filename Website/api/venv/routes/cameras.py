from flask import Blueprint, jsonify, request, session, send_file
from model import UserCameras, db
from datetime import datetime
from io import BytesIO

camera_bp = Blueprint('camera_bp', __name__)

@camera_bp.route('/get_user_cameras', methods=['GET'])
def get_user_cameras():
    user_id = session.get("user_id") 
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    try:
        cameras = UserCameras.query.filter_by(user_id=user_id).all()
        camera_list = [
            {
                "device_id": camera.device_id,
                "device_name": camera.device_name,
                "last_updated": camera.last_updated,
            } 
            for camera in cameras
        ]
        return jsonify({"cameras": camera_list}), 200
    except Exception as e:
        return jsonify({"error": f"{str(e)}"}), 500
    
@camera_bp.route('/add_user_camera', methods=['POST'])
def add_user_camera():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    device_id = data.get("device_id")
    device_name = data.get("device_name")
    if not device_id:
        return jsonify({"error": "Missing device_id"}), 400
    new_camera = UserCameras(device_id=device_id, user_id=user_id, device_name=device_name)
    db.session.add(new_camera)
    db.session.commit()
    return jsonify({"message": "Camera added successfully"}), 201

@camera_bp.route('/delete_user_camera', methods=["POST"])
def delete_user_camera():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401
    device_id = request.get_json().get("device_id")
    user_camera = UserCameras.query.filter_by(user_id=user_id, device_id=device_id).first()
    if not user_camera:
        return jsonify({"error": "Camera not found"}), 404
    db.session.delete(user_camera)
    db.session.commit()
    return jsonify({"message": "Camera successfully deleted"}), 200

@camera_bp.route('/update_camera_name', methods=['POST'])
def update_camera_name():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    device_id = data.get("device_id")
    new_device_name = data.get("new_device_name")

    if not device_id or not new_device_name:
        return jsonify({"error": "Missing device_id or new_device_name"}), 400

    camera = UserCameras.query.filter_by(user_id=user_id, device_id=device_id).first()
    if not camera:
        return jsonify({"error": "Camera not found"}), 404

    camera.device_name = new_device_name
    db.session.commit()

    return jsonify({"message": "Camera name updated successfully"}), 200

@camera_bp.route('/update_thumbnail', methods=['POST'])
def update_thumbnail():
    device_id = request.form.get("device_id")
    if not device_id:
        return jsonify({"error": "Missing device_id"}), 400

    file = request.files.get("thumbnail")
    if not file:
        return jsonify({"error": "No image provided"}), 400

    image_data = file.read()
    user_cameras = UserCameras.query.filter_by(device_id=device_id).all()

    if not user_cameras:
        return jsonify({"error": "Device not found"}), 404
    for user_camera in user_cameras:
        user_camera.thumbnail = image_data
        user_camera.last_updated = datetime.utcnow()
        db.session.commit()
        print("successfully updated")

    return jsonify({"message": "Thumbnail updated successfully"}), 200


@camera_bp.route("/get_thumbnail/<int:device_id>", methods=["GET"])
def get_thumbnail(device_id):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    camera = UserCameras.query.filter_by(user_id=user_id, device_id=device_id).first()

    if not camera or not camera.thumbnail:
        return jsonify({"error": "Thumbnail not found"}), 404

    return send_file(BytesIO(camera.thumbnail), mimetype='image/jpeg')