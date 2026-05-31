from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..db.session import get_session
from ..models.user import User
from ..schemas.user import UserRegister, UserLogin, UserOut, TokenOut
from ..core.security import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def register(body: UserRegister, session: Session = Depends(get_session)):
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
    )
    session.add(user)
    session.commit()
    session.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenOut(access_token=token, user=UserOut.model_validate(user))


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

    token = create_access_token({"sub": str(user.id)})
    return TokenOut(access_token=token, user=UserOut.model_validate(user))
