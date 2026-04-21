import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_otp_email(to_email: str, otp: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("SMTP configuration is missing. Cannot send OTP.")
        return

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = "Your PromptSplitwise OTP"

    body = f"Your OTP for PromptSplitwise registration is: {otp}\nThis OTP is valid for 10 minutes."
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"OTP sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")


def send_password_reset_email(to_email: str, otp: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print("SMTP configuration is missing. Cannot send password reset OTP.")
        return

    msg = MIMEMultipart()
    msg['From'] = settings.SMTP_USER
    msg['To'] = to_email
    msg['Subject'] = "PromptSplitwise Password Reset OTP"

    body = (
        f"Your OTP for resetting your PromptSplitwise password is: {otp}\n"
        "This OTP is valid for 10 minutes.\n"
        "If you did not request a password reset, please ignore this email."
    )
    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Password reset OTP sent to {to_email}")
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
