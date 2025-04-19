from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User (db.Model):
    __tablename__ = "users"
    phone_number = db.Column(db.String(15))
    first_name = db.Column(db.String(25))
    last_name = db.Column(db.String(25))
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(145), unique=True)
    password = db.Column(db.String(128), nullable=False)
    account_type = db.Column(db.String(10), default = 'user')

class Notification (db.Model):
    __tablename__ = "notifications"
    device_id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.String(25), primary_key=True)
    message = db.Column(db.String(50))
    notif_type = db.Column(db.String(25))
    read = db.Column(db.Boolean, default=False)
    snapshot = db.Column(db.LargeBinary) 

class UserCameras (db.Model):
    __tablename__ = "user_cameras"
    device_id = db.Column(db.Integer)
    user_id = db.Column(db.String(32))
    device_name = db.Column(db.String(100))
    thumbnail = db.Column(db.LargeBinary) 
    last_updated = db.Column(db.DateTime, nullable=True)
    order = db.Column(db.Integer, default=0)
    __table_args__ = (db.PrimaryKeyConstraint(device_id, user_id),)

class EmergencyContact (db.Model):
    __tablename__ = "emergency_contact"
    user_id = db.Column(db.String(32), primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(128), primary_key=True)
    phone = db.Column(db.String(15))
    notify_pistol = db.Column(db.Boolean, default=False)
    notify_person = db.Column(db.Boolean, default=False)
    notify_package = db.Column(db.Boolean, default=False)
    notify_fire = db.Column(db.Boolean, default=False)