import smtplib
from dotenv import load_dotenv
from model import User, EmergencyContact
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
import base64
import os

SCOPES = ['https://www.googleapis.com/auth/gmail.send']

load_dotenv()

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
        notify = getattr(contact, f'notify_{notification.type}', False)
        if notify: 
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
