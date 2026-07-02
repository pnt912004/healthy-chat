import uuid
import requests
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from ..db.session import get_session
from ..models.user import User, VerificationToken
from ..schemas.user import UserRegister, UserLogin, UserOut, TokenOut
from ..core.security import hash_password, verify_password, create_access_token
from ..core.email import send_verification_email
from ..core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


from fastapi import BackgroundTasks

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: UserRegister, background_tasks: BackgroundTasks, session: Session = Depends(get_session)):
    # Kiểm tra username và email đã tồn tại chưa
    existing = session.exec(
        select(User).where(
            (User.username == body.username) | (User.email == body.email)
        )
    ).first()
    if existing:
        if existing.username == body.username:
            raise HTTPException(status_code=400, detail="Username đã tồn tại")
        raise HTTPException(status_code=400, detail="Email đã được đăng ký")

    user = User(
        username=body.username,
        email=body.email,
        phone=body.phone,
        first_name=body.first_name,
        last_name=body.last_name,
        hashed_password=hash_password(body.password),
        is_verified=False
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    # Sinh token và lưu vào DB
    token_str = str(uuid.uuid4())
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    verification_token = VerificationToken(
        user_id=user.id,
        token=token_str,
        expires_at=expires
    )
    session.add(verification_token)
    session.commit()

    # Gửi email chạy ngầm để không bị timeout (Render free tier / SMTP chậm)
    background_tasks.add_task(send_verification_email, user.email, token_str)

    return {"detail": "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản."}


from pydantic import BaseModel
class VerifyEmailRequest(BaseModel):
    token: str

@router.post("/verify-email")
def verify_email(body: VerifyEmailRequest, session: Session = Depends(get_session)):
    vt = session.exec(select(VerificationToken).where(VerificationToken.token == body.token)).first()
    if not vt:
        raise HTTPException(status_code=400, detail="Token không hợp lệ hoặc không tồn tại")
    
    if vt.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Token đã hết hạn")
    
    user = session.exec(select(User).where(User.id == vt.user_id)).first()
    if not user:
        raise HTTPException(status_code=400, detail="Không tìm thấy người dùng")
    
    user.is_verified = True
    session.add(user)
    session.delete(vt)
    session.commit()
    
    return {"detail": "Xác thực email thành công"}


@router.post("/login", response_model=TokenOut)
def login(body: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.username == body.username)).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tên đăng nhập hoặc mật khẩu không đúng",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Tài khoản đã bị khóa")
    if not getattr(user, "is_verified", True):
        raise HTTPException(status_code=400, detail="Vui lòng xác thực email trước khi đăng nhập")

    # Xác thực Captcha
    if settings.RECAPTCHA_SECRET_KEY:
        if not body.captcha_token:
            raise HTTPException(status_code=400, detail="Vui lòng xác nhận Captcha")
        r = requests.post("https://www.google.com/recaptcha/api/siteverify", data={
            "secret": settings.RECAPTCHA_SECRET_KEY,
            "response": body.captcha_token
        })
        res = r.json()
        if not res.get("success"):
            raise HTTPException(status_code=400, detail="Xác thực Captcha thất bại")

    token = create_access_token({"sub": str(user.id)})
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


from ..schemas.user import GoogleLogin

@router.post("/google", response_model=TokenOut)
def google_login(body: GoogleLogin, session: Session = Depends(get_session)):
    try:
        idinfo = id_token.verify_oauth2_token(
            body.id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        email = idinfo.get("email")
        if not email:
            raise HTTPException(status_code=400, detail="Không lấy được email từ Google")
            
        user = session.exec(select(User).where(User.email == email)).first()
        if not user:
            # Tạo tài khoản mới nếu chưa tồn tại
            # Chúng ta dùng UUID làm username nếu tên đã tồn tại hoặc tạo từ email
            username_base = email.split("@")[0]
            username = username_base
            suffix = 1
            while session.exec(select(User).where(User.username == username)).first():
                username = f"{username_base}{suffix}"
                suffix += 1
                
            user = User(
                username=username,
                email=email,
                first_name=idinfo.get("given_name"),
                last_name=idinfo.get("family_name"),
                hashed_password=hash_password(str(uuid.uuid4())), # Mật khẩu ngẫu nhiên
                is_verified=True, # Đã xác thực qua Google
                avatar_url=idinfo.get("picture")
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            
        if not user.is_active:
            raise HTTPException(status_code=400, detail="Tài khoản đã bị khóa")
            
        token = create_access_token({"sub": str(user.id)})
        return TokenOut(access_token=token, user=UserOut.model_validate(user))
    except ValueError:
        raise HTTPException(status_code=400, detail="Token Google không hợp lệ")
