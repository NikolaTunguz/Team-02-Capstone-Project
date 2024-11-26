from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

def get_uuid():
    return uuid4().hex

class User (db.Model):
    __tablename__ = "users"
    first_name = db.Column(db.String(25))
    last_name = db.Column(db.String(25))
    id = db.Column(db.String(32), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(145), unique=True)
    password = db.Column(db.String(128), nullable=False)

class Notification (db.Model):
    __tablename__ = "notifications"
    device_id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.String(25), primary_key=True)

class UserCameras (db.Model):
    __tablename__ = "user_cameras"
    device_id = db.Column(db.Integer)
    user_id = db.Column(db.String(32))
    __table_args__ = (db.PrimaryKeyConstraint(device_id, user_id),)