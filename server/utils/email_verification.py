import smtplib
import random
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import current_app

verification_codes = dict()

def generate_verification_code():
    return str(random.randint(100000, 999999))

def send_verification_email(email, code):
    smtp_server = current_app.config['SMTP_SERVER']
    smtp_port = current_app.config['SMTP_PORT']
    smtp_user = current_app.config['SMTP_USER']
    smtp_password = current_app.config['SMTP_PASSWORD']
    sender_email = current_app.config.get('SENDER_EMAIL', smtp_user)

    message = MIMEMultipart("alternative")
    message["Subject"] = "Verify Your Email"
    message["From"] = sender_email
    message["To"] = email

    text = f"Your verification code is: {code}"
    html = f"<p>Your verification code is: <strong>{code}</strong></p>"

    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
        server.login(smtp_user, smtp_password)
        server.sendmail(sender_email, email, message.as_string())

def store_verification_code(email, code):
    verification_codes[email] = code

def verify_code(email, input_code):
    return verification_codes.get(email) == input_code