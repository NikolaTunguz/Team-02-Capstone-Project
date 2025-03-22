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
    
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender_email
    message["To"] = recipient_email
    message.set_content(body)

    if image_path and os.path.exists(image_path):
        with open(image_path, "rb") as img_file:
            img_data = img_file.read()
            msg.add_attachment(img_data, maintype="image", subtype="jpeg", filename="event_snapshot.jpg")

    
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
            send_email(contact.email, subject, body, notification.image_path)

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
        print("WASD", user.email)
        print("WASD", user.id)
        if user.email:
                send_email(user.email, subject, body, notification.image_path)
