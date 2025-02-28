import smtplib
from twilio.rest import Client
from model import db, Notification, UserCameras, User, EmergencyContact
from sqlalchemy import select
import json
from dotenv import load_dotenv
import os

def send_email(recipient_email, subject, body):
    load_dotenv()
    sender_email = "seethrucapstone@gmail.com"
    sender_password = os.getenv('SMTP_APP_PASSWORD')
    print(f"SMTP password: {sender_password}")
    
    message = f"Subject: {subject}\n\n{body}"
    
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, recipient_email, message)

def notify_emergency_contacts(user_id, notification, camera_name):
    contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
    user = User.query.filter_by(id=user_id).first()

    for contact in contacts:
        subject = "Emergency Notification Alert"
        body = f"""
        Dear {contact.first_name + " " + contact.last_name},

        An emergency alert has been triggered for {user.first_name  + " " +  user.last_name} for camera {camera_name}.
        
        Alert Details:
        ------------------------------
        Message: {notification.message}
        Date and Time: {notification.timestamp}
        
        We advise you to take the necessary steps to ensure the safety and well-being of your contact as soon as possible.

        Regards, 
        SeeThru 
        """
        if contact.email:
            send_email(contact.email, subject, body)

def notify_user(user, notification, camera_name): 
        subject = "Emergency Notification Alert"
        body = f"""
        Dear {user.first_name + " " + user.last_name},

        An emergency alert has been triggered for your camera "{camera_name}".
        
        Alert Details:
        ------------------------------
        Message: {notification.message}
        Date and Time: {notification.timestamp}
        

        Regards, 
        SeeThru 
        """
        if user.email:
            send_email(user.email, subject, body)
