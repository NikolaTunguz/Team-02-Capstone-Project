<<<<<<< HEAD
import smtplib
from dotenv import load_dotenv
=======
import os
import json
import base64
import pickle
>>>>>>> stage
from model import User, EmergencyContact
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
<<<<<<< HEAD
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import base64
import os

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

load_dotenv()
=======

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request

SCOPES = ['https://www.googleapis.com/auth/gmail.send']
credential_path = os.path.join(os.path.dirname(__file__), 'credentials.json')
token_path = os.path.join(os.path.dirname(__file__), 'token.pkl')

def save_credentials(creds):
    with open(token_path, 'wb') as token:
        pickle.dump(creds, token)

def load_credentials():
    creds = None
    if os.path.exists(token_path):
        with open(token_path, 'rb') as token:
            creds = pickle.load(token)
    return creds

def get_gmail_service():
    creds = load_credentials()

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(credential_path, SCOPES)
            creds = flow.run_console()
            save_credentials(creds)

    service = build('gmail', 'v1', credentials=creds)
    return service

def send_email(recipient_email, subject, body_text, image_bytes=None):
    sender_email = "seethrucapstone@gmail.com"

    msg = MIMEMultipart('related')
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = recipient_email

    html_body = f"""
    <html>
      <body>
        <p>{body_text.replace(chr(10), '<br>')}</p>
        { '<img src="cid:snapshot_image" alt="Snapshot" style="max-width:600px;"/>' if image_bytes else '' }
      </body>
    </html>
    """

    msg_alternative = MIMEMultipart('alternative')
    msg.attach(msg_alternative)
    msg_alternative.attach(MIMEText(body_text, 'plain'))
    msg_alternative.attach(MIMEText(html_body, 'html'))

    if image_bytes:
        image = MIMEImage(image_bytes)
        image.add_header('Content-ID', '<snapshot_image>')
        msg.attach(image)

    raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
    message = {'raw': raw_message}

    try:
        service = get_gmail_service()
        service.users().messages().send(userId='me', body=message).execute()
        print(f"Email successfully sent to {recipient_email}")
    except Exception as e:
        print("Error sending email via Gmail API:", e)
>>>>>>> stage

def notify_user(user, notification, camera_name):
    subject = "Emergency Notification Alert"
    body = f"""
    Dear {user.first_name} {user.last_name},

    An emergency alert has been triggered for your camera "{camera_name}".

    Alert Details:
    ------------------------------
    Message: {notification.message}
    Date and Time: {notification.timestamp}

    Regards,
    SeeThru
    """
    if user.email:
        send_email(user.email, subject, body, image_bytes=notification.snapshot)

def notify_emergency_contacts(user_id, notification, camera_name):
    contacts = EmergencyContact.query.filter_by(user_id=user_id).all()
    user = User.query.filter_by(id=user_id).first()

    for contact in contacts:
        # Adjust according to your model's field (notif_type or type)
        notify = getattr(contact, f'notify_{notification.notif_type}', False)
        if notify and contact.email:
            subject = "Emergency Notification Alert"
            body = f"""
            Dear {contact.first_name} {contact.last_name},

            An emergency alert has been triggered for {user.first_name} {user.last_name}, for camera "{camera_name}".

            Alert Details:
            ------------------------------
            Message: {notification.message}
            Date and Time: {notification.timestamp}

            Please ensure their safety.

            Regards,
            SeeThru
            """
<<<<<<< HEAD
            if contact.email:
                send_email(contact.email, subject, body, image_bytes=notification.snapshot)

def get_gmail_service():
    creds = None
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return build('gmail', 'v1', credentials=creds)

def send_email(recipient_email, subject, body_text, image_bytes=None):
    sender_email = "seethrucapstone@gmail.com"

    msg = MIMEMultipart('related')
    msg['Subject'] = subject
    msg['From'] = sender_email
    msg['To'] = recipient_email

    html_body = f"""
    <html>
      <body>
        <p>{body_text.replace(chr(10), '<br>')}</p>
        { '<img src="cid:snapshot_image" alt="Snapshot" style="max-width:600px;"/>' if image_bytes else '' }
      </body>
    </html>
    """

    msg_alternative = MIMEMultipart('alternative')
    msg.attach(msg_alternative)
    msg_alternative.attach(MIMEText(body_text, 'plain'))
    msg_alternative.attach(MIMEText(html_body, 'html'))

    if image_bytes:
        image = MIMEImage(image_bytes)
        image.add_header('Content-ID', '<snapshot_image>')
        msg.attach(image)

    raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode()
    message = {'raw': raw_message}

    service = get_gmail_service()
    service.users().messages().send(userId='me', body=message).execute()
=======
            send_email(contact.email, subject, body, image_bytes=notification.snapshot)
>>>>>>> stage
