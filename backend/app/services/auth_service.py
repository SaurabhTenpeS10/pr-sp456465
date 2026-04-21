import random
from datetime import datetime, timedelta
from typing import Optional

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    REFRESH_TOKEN_TYPE,
)
from app.models.user import User
from app.schemas.auth import TokenPair
from app.services.email_service import send_otp_email, send_password_reset_email


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower()).first()


def create_user(
    db: Session, email: str, password: str, name: Optional[str] = None
) -> User:
    otp = str(random.randint(100000, 999999))
    user = User(
        email=email.lower(),
        password_hash=hash_password(password),
        name=name,
        otp_code=otp,
        otp_expires_at=datetime.utcnow() + timedelta(minutes=10)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    send_otp_email(user.email, otp)
    
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    if not user.is_active or not user.is_email_verified:
        return None
    return user


def build_token_pair(user: User) -> TokenPair:
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


def refresh_access_token(db: Session, refresh_token: str) -> TokenPair:
    payload = decode_token(refresh_token, expected_type=REFRESH_TOKEN_TYPE)
    user_id = payload.get("sub")
    if not user_id:
        raise ValueError("Invalid refresh token payload")

    user = db.query(User).filter(User.id == user_id, User.is_active.is_(True)).first()
    if not user:
        raise ValueError("User not found or inactive")

    return build_token_pair(user)


def request_password_reset(db: Session, email: str) -> bool:
    user = get_user_by_email(db, email)
    if not user or not user.is_active:
        return False

    otp = str(random.randint(100000, 999999))
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()
    db.refresh(user)

    send_password_reset_email(user.email, otp)
    return True


def _validate_reset_otp(user: Optional[User], otp: str) -> None:
    if not user:
        raise ValueError("User not found")
    if not user.otp_code or not user.otp_expires_at:
        raise ValueError("No active password reset request")
    if user.otp_code != otp:
        raise ValueError("Invalid OTP")
    if user.otp_expires_at < datetime.utcnow():
        raise ValueError("OTP expired")


def verify_reset_otp(db: Session, email: str, otp: str) -> None:
    user = get_user_by_email(db, email)
    _validate_reset_otp(user, otp)


def confirm_password_reset(db: Session, email: str, otp: str, new_password: str) -> None:
    user = get_user_by_email(db, email)
    _validate_reset_otp(user, otp)

    user.password_hash = hash_password(new_password)
    user.otp_code = None
    user.otp_expires_at = None
    if not user.is_email_verified:
        user.is_email_verified = True
    db.commit()
    db.refresh(user)
