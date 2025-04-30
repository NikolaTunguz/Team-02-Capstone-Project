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
    notify_pistol = db.Column(db.Boolean, default=True)
    notify_person = db.Column(db.Boolean, default=True)
    notify_package = db.Column(db.Boolean, default=True)
    notify_fire = db.Column(db.Boolean, default=True)
    notification_settings = db.relationship(
        "UserNotificationSettings",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        single_parent=True
    )

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
    user_id = db.Column(db.String(32), db.ForeignKey("users.id", ondelete='CASCADE'), nullable=False)
    device_name = db.Column(db.String(100))
    thumbnail = db.Column(db.LargeBinary) 
    last_updated = db.Column(db.DateTime, nullable=True)
    order = db.Column(db.Integer, default=0)
    __table_args__ = (db.PrimaryKeyConstraint(device_id, user_id),)
    user = db.relationship("User", backref=db.backref("cameras", cascade="all, delete-orphan"))

class EmergencyContact (db.Model):
    __tablename__ = "emergency_contact"
    user_id = db.Column(db.String(32), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    email = db.Column(db.String(128), primary_key=True)
    phone = db.Column(db.String(15))
    notify_pistol = db.Column(db.Boolean, default=False)
    notify_person = db.Column(db.Boolean, default=False)
    notify_package = db.Column(db.Boolean, default=False)
    notify_fire = db.Column(db.Boolean, default=False)
    user = db.relationship("User", backref=db.backref("emergency_contacts", cascade="all, delete-orphan"))

class UserNotificationSettings(db.Model):
    __tablename__ = "user_notification_settings"
    user_id = db.Column(db.String(32), db.ForeignKey('users.id', ondelete='CASCADE'), primary_key=True)
    notify_pistol = db.Column(db.Boolean, default=True)
    notify_person = db.Column(db.Boolean, default=True)
    notify_package = db.Column(db.Boolean, default=True)
    notify_fire = db.Column(db.Boolean, default=True)
    user = db.relationship("User", back_populates="notification_settings", single_parent=True)
