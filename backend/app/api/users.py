from datetime import datetime
import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session
from sqlmodel import Session

from ..db.session import get_session
from ..models.user import User
from ..schemas.user import UserOut, UserUpdate, PasswordChange
from ..core.security import get_current_user, hash_password, verify_password

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserOut)
def update_me(
    body: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(current_user, key, value)
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.post("/me/avatar", response_model=UserOut)
def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Chỉ hỗ trợ tệp định dạng hình ảnh")

    # Đảm bảo thư mục tồn tại
    upload_dir = "uploads/avatars"
    os.makedirs(upload_dir, exist_ok=True)

    # Tạo tên file an toàn với uuid
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    safe_filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(upload_dir, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Cập nhật đường dẫn vào database
    current_user.avatar_url = f"http://localhost:8000/uploads/avatars/{safe_filename}"
    current_user.updated_at = datetime.utcnow()
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user


@router.put("/me/password")
def change_password(
    body: PasswordChange,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Mật khẩu hiện tại không đúng")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Mật khẩu mới phải có ít nhất 8 ký tự")

    current_user.hashed_password = hash_password(body.new_password)
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    return {"message": "Đổi mật khẩu thành công"}


@router.delete("/me")
def delete_me(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    current_user.is_active = False
    current_user.updated_at = datetime.utcnow()
    session.add(current_user)
    session.commit()
    return {"message": "Tài khoản đã được vô hiệu hóa"}
