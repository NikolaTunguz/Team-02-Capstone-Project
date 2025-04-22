from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
import smtplib
import os
from dotenv import load_dotenv
from model import User, EmergencyContact

load_dotenv()

def send_email(recipient_email, subject, body_text, image_bytes=None):
    sender_email = "seethrucapstone@gmail.com"
    sender_password = os.getenv('SMTP_APP_PASSWORD')

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

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)

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
        notify = getattr(contact, f'notify_{notification.notif_type}', False)
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
