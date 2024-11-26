from flask_cors import CORS
from flask import Flask, send_from_directory, request, session
from config import ApplicationConfig
from model import db, Notification, UserCameras, User
from routes.auth import auth_bp
from sqlalchemy import select, desc
import json

app = Flask(__name__)
cors = CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
app.config.from_object(ApplicationConfig)
app.register_blueprint(auth_bp)

db.init_app(app)
with app.app_context():
    db.create_all()

@app.route('/database', methods=['POST'])
def database(): 
    device_id = request.get_json().get("device_id")
    timestamp = request.get_json().get("timestamp")
    notification = Notification()
    notification.device_id = device_id
    notification.timestamp = timestamp
    db.session.add(notification)
    db.session.commit()
    return 200

@app.route('/notifications')
def notifications():
    user_id = session.get("user_id")
    query = select(
        Notification.timestamp
    ).select_from(UserCameras).join(
            Notification, UserCameras.device_id==Notification.device_id
    ).filter(
        UserCameras.user_id == user_id
    ).order_by(
        desc(Notification.timestamp)
    )

    notifications = db.session.execute(query).all()
    notifications = [timestamp[0].split("'")[0] for timestamp in notifications]
    
    return json.dumps(notifications, default=str)

@app.route('/first_last')
def username():
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

if __name__ == "__main__":
    app.run(debug=True, port=8080)