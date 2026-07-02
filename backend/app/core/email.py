import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_verification_email(to_email: str, token: str):
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        print(f"Mock Email to {to_email}: Please verify your account at {settings.FRONTEND_URL}/verify?token={token}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Xác nhận tài khoản HealthyChat"
    msg["From"] = settings.SMTP_USER
    msg["To"] = to_email

    verify_url = f"{settings.FRONTEND_URL}/verify?token={token}"

    text = f"Chào bạn,\nVui lòng nhấn vào đường link sau để xác nhận tài khoản: {verify_url}"
    html = f"""\
    <html>
      <body>
        <p>Chào bạn,</p>
        <p>Vui lòng nhấn vào đường link dưới đây để xác nhận tài khoản của bạn trên HealthyChat:</p>
        <p><a href="{verify_url}">{verify_url}</a></p>
        <p>Link này sẽ hết hạn sau 15 phút.</p>
      </body>
    </html>
    """

    part1 = MIMEText(text, "plain")
    part2 = MIMEText(html, "html")

    msg.attach(part1)
    msg.attach(part2)

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, to_email, msg.as_string())
        server.quit()
        print(f"Verification email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")
