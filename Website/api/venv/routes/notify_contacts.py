import smtplib
from twilio.rest import Client
from model import db, Notification, UserCameras, User, EmergencyContact
from sqlalchemy import select
import json

def send_email(recipient_email, subject, body):
    sender_email = "your_email@gmail.com"
    sender_password = "your_email_password"
    
    message = f"Subject: {subject}\n\n{body}"
    
    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.sendmail(sender_email, recipient_email, message)

def notify_emergency_contacts(user_id, message):
    contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
    
    for contact in contacts:
        subject = "Emergency Notification Alert"
        body = f"Alert: {message}"
        
        if contact.email:
            send_email(contact.email, subject, body)
