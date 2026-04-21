from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    RegisterResponse,
    LoginRequest,
    RefreshRequest,
    AuthResponse,
    TokenPair,
    VerifyOTPRequest,
    ForgotPasswordRequest,
    VerifyResetOTPRequest,
    ResetPasswordConfirmRequest,
    MessageResponse,
)
from app.schemas.user import UserPublic
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = auth_service.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    user = auth_service.create_user(
        db, email=payload.email, password=payload.password, name=payload.name
    )
    return RegisterResponse(message="OTP sent successfully")

from datetime import datetime

@router.post("/verify-otp", response_model=AuthResponse)
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, payload.email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.is_email_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified",
        )
    if user.otp_code != payload.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP",
        )
    if user.otp_expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="OTP expired",
        )
    
    user.is_email_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)
    
    tokens = auth_service.build_token_pair(user)
    return AuthResponse(user=UserPublic.model_validate(user), tokens=tokens)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    tokens = auth_service.build_token_pair(user)
    return AuthResponse(user=UserPublic.model_validate(user), tokens=tokens)


@router.post("/refresh", response_model=TokenPair)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        return auth_service.refresh_access_token(db, payload.refresh_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        )


@router.get("/profile", response_model=UserPublic)
def profile(current_user: User = Depends(get_current_user)):
    return UserPublic.model_validate(current_user)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    # Stateless JWT - client must discard tokens. Extend with token blacklist if needed.
    return {"message": "Logged out successfully"}


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    auth_service.request_password_reset(db, payload.email)
    # Always respond with success to avoid user enumeration
    return MessageResponse(message="If the email exists, an OTP has been sent")


@router.post("/verify-reset-otp", response_model=MessageResponse)
def verify_reset_otp(payload: VerifyResetOTPRequest, db: Session = Depends(get_db)):
    try:
        auth_service.verify_reset_otp(db, payload.email, payload.otp)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        )
    return MessageResponse(message="OTP verified successfully")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordConfirmRequest, db: Session = Depends(get_db)):
    try:
        auth_service.confirm_password_reset(
            db, payload.email, payload.otp, payload.new_password
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        )
    return MessageResponse(message="Password reset successfully")
