from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None


class UserPublic(UserBase):
    id: str
    avatar_url: Optional[str] = None
    subscription_tier: str
    is_email_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
