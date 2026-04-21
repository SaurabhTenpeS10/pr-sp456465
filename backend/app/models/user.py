import uuid
from datetime import datetime

from sqlalchemy import Column, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    avatar_url = Column(String(512), nullable=True)
    subscription_tier = Column(String(50), default="free", nullable=False)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime, server_default=func.now(), onupdate=func.now(), nullable=False
    )

    conversations = relationship(
        "Conversation", back_populates="user", cascade="all, delete-orphan"
    )
    cache_entries = relationship(
        "CacheEntry", back_populates="user", cascade="all, delete-orphan"
    )
